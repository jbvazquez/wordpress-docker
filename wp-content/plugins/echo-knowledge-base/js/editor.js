'use strict';
jQuery(document).ready(function($) {

	// we need Editor settings to continue
	// noinspection JSUnresolvedVariable
	if ( typeof epkb_editor_config == 'undefined' || epkb_editor_config == null || epkb_editor_config.length == 0 ) {
		return true;
	}

	window.EPKBEditor = {

		init: function(){
			// start app only once
			if ( typeof this.initSettings !== 'undefined' ) {
				return;
			}
			
			let app = this;
			
			// catch errors reported by the JS errors handler 
			$(document).on('epkb_js_error', function( event, errorMsg, url, lineNumber, columnNumber, errorObject ){
				app.errorHandler( errorMsg, url, lineNumber, columnNumber, errorObject );
			});
			
			// notice close 
			$(document).on( 'click', '.epkb-close-notice', app, function( event ){
				
				if ( $(this).closest('.eckb-bottom-notice-message').hasClass('eckb-bottom-notice-message--center-aligned') ) {
					event.data.toggleMode( event );
				} else {
					$(this).closest('.eckb-bottom-notice-message').remove();
					$('body').removeClass('epkb-showing-message');
				}
				
			});
			
			$(document).on('submit', '#epkb-editor-error--form', app, this.sendErrorMessage );
			
			this.showLoader();

			// order is important
			this.addModalWrap();
			// noinspection JSUnresolvedVariable
			this.initSettings = Object.assign( {}, epkb_editor_config );
			this.currentSettings = Object.assign( {}, epkb_editor_config );
			this.currentEditorSettings = Object.assign( {}, epkb_editor_settings );
			this.activeZone = '';
			this.addIframe();
		},
		
		addModalWrap: function(){
			if ( $('#epkb-editor').length > 0 ) {
				return true;
			}

			$('body').append( EPKBEditorTemplates.modalWindow() );
			$('.epkb-editor-settings__panel-content-container').append( EPKBEditorTemplates.notice( { 'icon' : 'arrow-circle-right','title' : epkb_editor.clear_modal_notice, 'style' : 'edit-zone' } ) );
			this.modal = $('#epkb-editor');
			this.showModal(); 
			this.bindModalEvents();

			// Hide help link
			$('.epkb-editor-settings__panel-content-container .epkb-editor-settings__help').hide();
		},

		addIframe: function(){

			let iframe = document.createElement('iframe');
			this.url = new URL( location.href );
			this.url.searchParams.set( 'epkb-editor', '1' );
			iframe.src = this.url;
			iframe.id = 'epkb-editor-iframe';
			
			let app = this;
			
			// this value is not "false" until iframe is loaded
			this.loadingIframe = setTimeout( function(){
				// show timeout notice
				app.errorHandler( 'timeout1' );
			}, 20000 );

			this.longLoadingIframe = setTimeout( function(){
				// show timeout error and delete the iframe and loader
				app.errorHandler( 'timeout2' );
			}, 40000 );

			document.body.appendChild(iframe);

			$('#epkb-editor-iframe').on( 'load', this, this.afterLoadIframe ); // will fire on iframe update too
		},

		afterLoadIframe: function( event ) {

			//ds()

			// "this"
			let app = event.data;

			// "wrap" for edit screen
			app.iframe = $('#epkb-editor-iframe').contents();
			
			if ( app.iframe.length && app.iframe.find('[class*="epkb"], [class*="eckb"], [class*="elay"]').length ) {
				$('.epkb-frontend-loader').addClass('epkb-frontend-loader--iframe');
			} else {
				// remove loader 
				app.removeLoader();
				
				// trigger CRP error if there is one due to CRP mis-configuration
				let t = $('#epkb-editor-iframe')[0].contentWindow.document;
				
				return;
			}

			// load new zones settings if exists
			let newConfig = $('#epkb-editor-iframe')[0].contentWindow.epkb_editor_config;
			
			for ( let zoneName in newConfig ) {
				// if zone absent 
				if ( typeof app.currentSettings[zoneName] == 'undefined' ) {
					app.currentSettings[zoneName] = newConfig[zoneName];
					continue;
				}
				
				// check settings
				for ( let fieldName in newConfig[zoneName].settings ) {
					if ( typeof app.currentSettings[zoneName].settings[fieldName] == 'undefined' ) {
						app.currentSettings[zoneName].settings[fieldName] = newConfig[zoneName].settings[fieldName];
					}
				}
				
				// remove old 
				for ( let fieldName in app.currentSettings[zoneName].settings ) {
					if ( typeof newConfig[zoneName].settings[fieldName] == 'undefined' ) {
						
						delete app.currentSettings[zoneName].settings[fieldName];
					}
				}
			}
			
			for ( let zone_name in app.currentSettings ) {
				if ( typeof newConfig[zone_name] == 'undefined' ) {
					delete app.currentSettings[zone_name];
				}
			}
			
			// update current panel
			if ( $('[name=theme_presets]').length ) {
				app.refreshPanel( app );
			}

			// add styles tag to change styles in the iframe because jquery can't change hovers
			app.iframe.find('body').append(`<style type="text/css" id="epkb-editor-style"></style>`);
			app.styles = app.iframe.find('#epkb-editor-style');

			// turn on styles for body to hide it only first time 
			if ( typeof app.loadingIframe == 'undefined' || app.loadingIframe ) {
				$('body').addClass('epkb-edit-mode');
			}

			// a lot of lo-end themes don't use body_class()
			app.iframe.find('body').addClass('epkb-editor-preview');
			
			// Get the Article Content Body Position
			let articleContentBodyPosition = app.iframe.find( '#eckb-article-content-body' ).position();

			
			// If the setting is on, Offset the Sidebar to match the article Content
			if ( app.iframe.find('.eckb-article-page--L-sidebar-to-content').length > 0 ) {
				app.iframe.find('#eckb-article-page-container-v2').find( '#eckb-article-left-sidebar ').css( "margin-top" , articleContentBodyPosition.top+'px' );
				
				app.iframe.find('#eckb-article-page-container-v2').find( '#eckb-article-left-sidebar').append('<style>#eckb-article-page-container-v2 #eckb-article-left-sidebar:before { height: ' + articleContentBodyPosition.top + 'px; }</style>');
			}
			
			if ( app.iframe.find('.eckb-article-page--R-sidebar-to-content').length > 0 ) {
				app.iframe.find('#eckb-article-page-container-v2').find( '#eckb-article-right-sidebar ').css( "margin-top" , articleContentBodyPosition.top+'px' );
				
				app.iframe.find('#eckb-article-page-container-v2').find( '#eckb-article-right-sidebar').append('<style>#eckb-article-page-container-v2 #eckb-article-right-sidebar:before { height: ' + articleContentBodyPosition.top + 'px; }</style>');
			}
			
			// highlight edit zones
			app.addEditZones();
			
			// add notice for sidebar main page 
			if ( app.iframe.find('#eckb-article-left-sidebar').length && ! app.iframe.find('#eckb-article-left-sidebar').hasClass('epkb-editor-zone') ) {
				app.iframe.on( 'click', '#eckb-article-left-sidebar', function( event ){
					app.showMessage({
						text: epkb_editor.sidebar_settings,
						type: 'attention',
						timeout: 5000
					});
					
					return false;
				});
			}
			
			if ( app.iframe.find('#eckb-article-right-sidebar').length && ! app.iframe.find('#eckb-article-right-sidebar').hasClass('epkb-editor-zone') ) {
				app.iframe.on( 'click', '#eckb-article-right-sidebar', function( event ){
					app.showMessage({
						text: epkb_editor.sidebar_settings,
						type: 'attention',
						timeout: 5000
					});
					
					return false;
				});
			}
			
			// fill settings with current zone after click
			app.iframe.on( 'click', '.epkb-editor-zone', app, app.onZoneClick );
			app.iframe.on( 'click', '.epkb-editor-zone__tabs', false );
			app.iframe.on( 'click', '.epkb-editor-zone__tab--parent', function( event ){
				
				event.stopPropagation();
				
				let zone = $(this).data('zone');
				
				$(this).parents('.epkb-editor-zone').each(function(){
					if ( $(this).data('zone') == zone ) {
						$(this).click();
						zone = false;
					}
				});
				
			} );

			// block links inside iframes
			app.iframe.find('a').click( function(e){
				e.preventDefault();
			} );
			
			// block forms on the page to prevent page change
			app.iframe.on( 'submit', 'form:not(#epkb-settings-form)', function(e){
				app.removeLoader();
				return false;
			} );
			
			app.iframe.find( '.epkb-editor-zone' ).hover( function(){
				$(this).addClass( 'hover' );

				let parents = $(this).parents( '.epkb-editor-zone' );

				if ( parents.length ) {
					setTimeout( function() {
						parents.removeClass( 'hover' );
					}, 50 );
				}

			}, function(){
				$(this).removeClass( 'hover' );
				if ( $(this).parents( '.epkb-editor-zone' ).length && ! $(this).parents( '.epkb-editor-zone--active' ).length ) {
					$(this).parents( '.epkb-editor-zone' ).eq(0).addClass( 'hover' );
				}
			} );

			app.iframe.find('input[name="epkb_search_terms"]').prop('autocomplete','off');

			app.updateStyles();
			app.updateAttributes();
			app.updateText();
			
			// pre-open settings 
			if ( epkb_editor.preopen == 'templates' ) {	
				epkb_editor.preopen = 'open_themes';
				$('.epkb-editor-header__inner__config').click();
				$('.epkb-editor-settings-menu__group-item-container[data-name=templates]').click();
			}
			
			if ( epkb_editor.preopen !== 'templates' && epkb_editor.preopen !== 'open_themes' && epkb_editor.preopen ) {
				app.preselectZone = epkb_editor.preopen;
			}
			
			// select zone if we have such task 
			if ( typeof app.preselectZone == 'undefined' || typeof app.currentSettings[app.preselectZone] == 'undefined' || app.iframe.find( app.currentSettings[app.preselectZone].classes ).length == 0 ) {
				app.removeLoader();
				app.clearErrorTimeouts(); // prevent timeout error 
				return;
			}
			
			app.iframe.find( app.currentSettings[app.preselectZone].classes ).click();
			app.preselectZone = undefined;
			app.removeLoader();
			
			app.clearErrorTimeouts(); // prevent timeout error 
		},

		addEditZones: function(){
			for ( let settingGroupSlug in this.currentSettings ) {

				let zoneWrapper = this.iframe.find(this.currentSettings[settingGroupSlug].classes);
				
				if ( zoneWrapper.length == 0 ) {
					continue;
				}

				zoneWrapper.addClass('epkb-editor-zone');
				zoneWrapper.data( 'zone', settingGroupSlug );
			}
		},

		bindModalEvents: function() {
			// close editor button
			$(document).on( 'click', '#epkb-editor-close', this, this.hideModal );
			$('#epkb-editor-exit').on( 'click', this, this.toggleMode );

			// change any setting on the panel
			$(document).on( 'change keyup', '#epkb-editor input:not([type=number]):not([type=text]), #epkb-editor textarea, #epkb-editor select', this, this.onFieldChange );
			
			// delay to let user input number with length > 1 before update the screen 
			$(document).on( 'change keyup', '#epkb-editor input[type=number], #epkb-editor input[type=text]', this, function( event ) {
				
				let app = event.data;
				let $el = $(this);
				
				if ( typeof app.numberTimer !== 'undefined' && app.numberTimer ) {
					clearTimeout(app.numberTimer);
				}
				
				app.numberTimer = setTimeout( function() {
					app.onFieldChange( event, $el, app );
				}, 500 );
			} );

			// modal tabs
			$(document).on( 'click', '#epkb-editor .epkb-editor-settings__panel-navigation__tab:not(.epkb-editor-settings__panel-navigation__tab--disabled)', this, this.onTabClick );
			
			// settings links 
			$(document).on( 'click', '.epkb-editor-settings-menu__group-item-container', this, this.onMenuItemClick );
			
			// linked inputs
			$(document).on( 'click', '#epkb-editor .epkb-editor-settings-control__input__linking', this, this.toggleLinkedDimensions );
			
			// save button
			$(document).on( 'click', '#epkb-editor-save', this, this.saveSettings );
			
			// Click on the gears button 
			$(document).on( 'click', '.epkb-editor-header__inner__config', this, this.showSettings );
			
			// Click on the eye button 
			$(document).on( 'click', '#epkb-editor-show-navigation', this, function( event ){
				event.stopPropagation();
				event.data.showNavigation()
			} );
			$(document).on( 'click', '.epkb-editor-navigation__link', this, function( event ) {
				
				let app = event.data;
				let iframe = app.iframe;
				let zone = $(this).data('zone');
				
				// open first tab on main page tabs template 
				if ( iframe.find( '#epkb_tab_1' ).length && (
					zone == 'category_header_zone' ||
					zone == 'categories_zone' ||
					zone == 'category_box_zone' ||
					zone == 'articles_zone' ) ) {
						
					iframe.find( '.epkb_top_categories.active' ).removeClass('active');	
					iframe.find( '#epkb_tab_1' ).addClass('active');
					iframe.find( '.epkb_top_panel.active' ).removeClass('active');	
					iframe.find( '.epkb_tab_1' ).addClass('active');
				}
				
				// open panel for the sidebar template 
				let elayArticleVisible = false;
				iframe.find( '.elay-articles' ).each(function(){
					if ( $(this).is(':visible') ) {
						elayArticleVisible = $(this);
						return false;
					}
				});
				
				if ( iframe.find( '.elay-top-class-collapse-on' ).length &&				
					! iframe.find( '.elay-sidebar__cat__top-cat' ).first().hasClass( 'elay-active-top-category' ) && (
					zone == 'sidebar_category_zone' ||
					( zone == 'sidebar_articles_zone' && ! elayArticleVisible ) ) ) {
	
					iframe.find( '.elay-sidebar__cat__top-cat__heading-container' ).first().trigger( 'click', [ false ] );
				}
				
				// open panel for the sidebar template 
				if ( iframe.find( '#asea-doc-search-container' ).length && 
					! iframe.find( '#asea-doc-search-container' ).is( ':visible' ) && (
					zone == 'search_box_zone' ||
					zone == 'search_title_zone' ||
					zone == 'search_below_title_zone' ||
					zone == 'search_input_zone' ||
					zone == 'search_box_below_input_zone' ) ) {
	
					iframe.find( '.asea-search-toggle' ).first().click();
				}
				
				if ( ! elayArticleVisible && zone == 'sidebar_articles_zone' ) {
					
					let articleUL = iframe.find( '.elay-articles' ).first();
					
					if ( ! articleUL.is( ':visible' ) ) {
						articleUL.parents( 'li' ).each( function() {
							$(this).children( '.elay-category-level-2-3' ).trigger( 'click', [ false ] );
						});
					}
				}
				
				// for custom links 
				if ( ( typeof $(this).data('target') == 'undefined' || ! $(this).data('target') ) && typeof app.currentSettings[ $(this).data('zone') ] != 'undefined' ) {
					$(this).data( 'target', app.currentSettings[ $(this).data('zone') ].classes );
				}
				
				let targetEl = ( elayArticleVisible && zone == 'sidebar_articles_zone' ) ? elayArticleVisible : iframe.find( $(this).data('target') ).first();

				// scroll iframe if need 
				if ( targetEl.length && ( ( ( targetEl.offset().top - 50 ) < iframe.scrollTop() ) || ( targetEl.offset().top > ( iframe.scrollTop() + $(window).height() ) ) ) ) {
					iframe.find('html').animate( {
						scrollTop: targetEl.offset().top - 100
					}, 200 );
				}
				
				if ( ( typeof event.originalEvent !== 'undefined' && $(event.target).hasClass('epkb-editor-navigation__link__help') ) || $(this).closest('.epkb-editor-navigation').length == 0 ) {
					// call zone panel 
					targetEl.click();
				} else {
					// only highlight 
					app.iframe.find( '.epkb-editor-zone' ).removeClass( 'epkb-editor-zone--active' );
					
					// Add Class to clicked on Zone
					targetEl.addClass( 'epkb-editor-zone--active' );
					targetEl.find( '.epkb-editor-zone.hover' ).removeClass('hover');
					app.iframe.find( '.epkb-editor-zone__tabs').remove();
					
					// Add tabs to Zone 
					if ( zone == 'search_input_zone' ) {
						app.addTabsToZone( targetEl.parent(), zone );
						targetEl.parent().addClass('epkb-editor-zone--active-visibility');
					} else {
						app.addTabsToZone( targetEl, zone );
					}
					
				}
				
				return false;
			});
			
			$(document).on( 'click', '.epkb-editor-navigation__activate-disabled-link', this, function( event ) {
				$('.epkb-editor-header__inner__config').click();
				$('#epkb-editor-settings-tab-hidden').click();
				return false;
			});
			
			// save/cancel editor button 
			$(document).on( 'click', '#epkb-editor-popup__button-cancel', this, this.onCancelWpEditor );
			$(document).on( 'click', '#epkb-editor-popup__button-update', this, this.onSaveWpEditor );
			$(document).on( 'click', '.epkb-editor-settings-wpeditor_button', this, this.showWpEditor );
			
			// back and close button in settings 
			$(document).on( 'click', '.epkb-editor-header__inner__back-btn', this, this.onBackClick );
			$(document).on( 'click', '.epkb-editor-header__inner__close-btn', this, this.onCloseClick );
			
			// click on the menu item 
			$( '#epkb-editor' ).on( 'click', '.epkb-editor-header__inner__menu-btn', this, this.showMenu );
			
			// eprf feedback settings 
			$( '#epkb-editor' ).on( 'click', '#eprf_edit_feedback_zone', this, function( event ) {
				let app = event.data;
				
				app.iframe.find('#eprf-article-feedback-container').click();
				
				return false;
			} );
			
			// Select prev and next buttons 
			$(document).on( 'click', '.epkb-editor-settings-control-type-select--prev-button', this, function( event ) {
				let $select = $(this).closest('.epkb-editor-settings-control__field').find('select');
				let currentOptions = [];
				let currentOptionsLabels = [];
				let $that = $(this);
				
				$select.find('option').each(function(){
					currentOptions.push($(this).val());
					currentOptionsLabels.push($(this).text());
				});
				
				if ( ! currentOptions.length ) {
					app.showMessage({
						text: epkb_editor.wrong_select,
						type: 'error'
					});
					return true;
				}
				
				$that.parent().find('.epkb-editor-settings-control-type-select--next-button').css({ 'visibility' : 'visible' });
				
				// if option is not selected 
				if ( ! ~currentOptions.indexOf( $select.val().toString() ) ) {
					$select.val( currentOptions[0] );
					$that.parent().find('.epkb-editor-settings-control-type-select--label').text( currentOptionsLabels[0] );
					
					$that.parent().find('.epkb-editor-settings-control-type-select--prev-button').css({ 'visibility' : 'hidden' });
					
					$select.trigger('change');
					return true;
				}
				
				let selected = false;
				
				currentOptions.forEach( function(currentValue, index, options ) {
					
					if ( selected || currentValue != $select.val() ) {
						return true;
					}
					
					if ( index == 0 ) { 
						$select.val( currentValue );
						$that.parent().find('.epkb-editor-settings-control-type-select--label').text( currentOptionsLabels[index] );
						
						$that.parent().find('.epkb-editor-settings-control-type-select--prev-button').css({ 'visibility' : 'hidden' });
						
						selected = true;
						return;
					}
					
					if ( index == 1 ) { 
						$select.val( options[ index - 1 ] );
						$that.parent().find('.epkb-editor-settings-control-type-select--label').text( currentOptionsLabels[ index - 1 ] );
						
						$that.parent().find('.epkb-editor-settings-control-type-select--prev-button').css({ 'visibility' : 'hidden' });
						
						selected = true;
						return;
					}
					
					$select.val( options[ index - 1 ] );
					$that.parent().find('.epkb-editor-settings-control-type-select--label').text( currentOptionsLabels[ index - 1 ] );
					
					$that.parent().find('.epkb-editor-settings-control-type-select--prev-button').css({ 'visibility' : 'visible' });
						
					selected = true;
					return;
					
				});
				
				$select.trigger('change');
			});
			
			$(document).on( 'click', '.epkb-editor-settings-control-type-select--next-button', this, function( event ) {
				let $select = $(this).closest('.epkb-editor-settings-control__field').find('select');
				let currentOptions = [];
				let currentOptionsLabels = [];
				let $that = $(this);
				
				$select.find('option').each(function(){
					currentOptions.push($(this).val());
					currentOptionsLabels.push($(this).text());
				});
				
				if ( ! currentOptions.length ) {
					app.showMessage({
						text: epkb_editor.wrong_select,
						type: 'error'
					});
					return true;
				}
				
				$that.parent().find('.epkb-editor-settings-control-type-select--prev-button').css({ 'visibility' : 'visible' });
				
				// if option is not selected 
				if ( ! ~currentOptions.indexOf( $select.val().toString() ) ) {
					$select.val( currentOptions[currentOptions.length - 1] );
					$that.parent().find('.epkb-editor-settings-control-type-select--label').text( currentOptionsLabels[currentOptions.length - 1] );
					$select.trigger('change');
					return true;
				}
				
				let selected = false;
				
				currentOptions.forEach( function(currentValue, index, options ) {
					
					if ( selected || currentValue != $select.val().toString() ) {
						return;
					}
					
					if ( index == ( options.length - 1 ) ) {

						$select.val( currentValue );
						$that.parent().find('.epkb-editor-settings-control-type-select--label').text( currentOptionsLabels[index] );
						
						$that.parent().find('.epkb-editor-settings-control-type-select--next-button').css({ 'visibility' : 'hidden' });
						
						selected = true;
						return;
					}
					
					$select.val( options[ index + 1 ] );
					$that.parent().find('.epkb-editor-settings-control-type-select--label').text( currentOptionsLabels[ index + 1 ] );
					
					if ( index >= ( options.length - 2 ) ) {
						$that.parent().find('.epkb-editor-settings-control-type-select--next-button').css({ 'visibility' : 'hidden' });
					} else {
						$that.parent().find('epkb-editor-settings-control-type-select--next-button').css({ 'visibility' : 'visible' });
					}
					
					selected = true;
					return;
					
				});
				
				$select.trigger('change');
			});
		},
		
		// delete all content from modal before fill it for the new zone/settings screen 
		clearModal: function () {
			$('.epkb-editor-container').removeClass('epkb-editor-container--navigator');
			$('.epkb-editor-header__inner__title').html('');
			$('.epkb-editor-settings__panel-navigation-container').html('');
			$('.epkb-editor-settings__panel-content-container').html(EPKBEditorTemplates.modalTabsBody());
			$('.epkb-editor-settings__panel-navigation-container, .epkb-editor-settings__panel-content-container').show();
			$( '.epkb-editor-settings-menu-container' ).hide();
			this.iframe.find('.epkb-editor-zone__tabs').remove();
			$('#epkb-editor-show-navigation').removeClass('epkb-editor-show-navigation--active');
		},
		
		// toggle back/close button to menu/settings 
		showMenuButtons: function() {
			$('.epkb-editor-header__inner__menu-btn').show();
			$('.epkb-editor-header__inner__config').show();
			$('.epkb-editor-header__inner__back-btn').hide();
			$('.epkb-editor-header__inner__close-btn').hide();
		},
		
		// call before changing active zone 
		showBackButtons: function() {
			$('.epkb-editor-header__inner__menu-btn').hide();
			$('.epkb-editor-header__inner__config').hide();
			$('.epkb-editor-header__inner__back-btn').show();
			$('.epkb-editor-header__inner__close-btn').show();
			
			// remember last zone that the user editing
			if ( this.activeZone !== 'settings' || this.activeZone !== 'menu' || this.activeZone !== 'settings_panels' ) {
				this.lastActiveZone = this.activeZone;
			}
			
		},

		/*******  TAB CHANGE   ********/

		onTabClick: function ( event ) {
			event.stopPropagation();

			let tabName = $(this).data('target');

			$('.epkb-editor-settings__panel-navigation__tab').removeClass('epkb-editor-settings__panel-navigation__tab--active');
			$('.epkb-editor-settings__panel').removeClass('epkb-editor-settings__panel--active');

			$(this).addClass('epkb-editor-settings__panel-navigation__tab--active');
			$('#epkb-editor-settings-panel-' + tabName).addClass('epkb-editor-settings__panel--active');
		},
		
		onMenuItemClick: function ( event ) {
			
			if ( $(this).attr('href') != '#' ) {
				return true; // usual link 
			}
			
			let app = event.data;
			
			$('.epkb-editor-settings-panel-global__links-container, .epkb-editor-settings__panel-navigation-container').hide();
			$('#epkb-editor-settings-panel-global>.epkb-editor-settings-control-container').hide();
			
			// open templates 
			if ( $(this).data('name') == 'templates' ) {
				$('#epkb-editor-settings-templates').show();
			}
			
			// open layouts 
			if ( $(this).data('name') == 'layouts' ) {
				$('#epkb-editor-settings-layouts').show();
			}
			
			app.showBackButtons();
			app.activeZone = 'settings_panels';
			
			return false;
			
		},
		
		// "<" button in menu/otions 
		onBackClick: function ( event ) {
			event.stopPropagation();
			
			let app = event.data;
			
			if ( app.activeZone == 'settings_panels' ) {
				// show settings 
				app.showSettings( event );
			} else if ( typeof ( app.currentSettings[app.lastActiveZone] ) !== 'undefined' ) {
				app.iframe.find( app.currentSettings[app.lastActiveZone].classes ).click();
				app.showMenuButtons();
			} else {
				// TODO initial screen 
				app.clearModal();
				$('.epkb-editor-header__inner__title').html( epkb_editor.epkb_name );
				$('.epkb-editor-settings__panel-content-container').append( EPKBEditorTemplates.notice( { 'icon' : 'info-circle','title' : epkb_editor.clear_modal_notice, 'style' : 'edit-zone' } ) );
				$('.epkb-editor-settings__help').hide();
				app.showMenuButtons();
			}
		},
		
		// "X" button in menu/options
		onCloseClick: function ( event ) {
			event.stopPropagation();
			
			let app = event.data;
			
			if ( typeof ( app.currentSettings[app.lastActiveZone] ) !== 'undefined' ) {
				app.iframe.find( app.currentSettings[app.lastActiveZone].classes ).click();
				app.showMenuButtons();
			} else {
				// TODO initial screen 
				app.clearModal();
				$('.epkb-editor-header__inner__title').html( epkb_editor.epkb_name );
				$('.epkb-editor-settings__panel-content-container').append( EPKBEditorTemplates.notice( { 'icon' : 'info-circle','title' : epkb_editor.clear_modal_notice, 'style' : 'edit-zone' } ) );
				$('.epkb-editor-settings__help').hide();
				app.showMenuButtons();
			}
		},


		/*******  FIELD OPERATIONS   ********/

		onFieldChange: function( event, $el, app ) {	

			if ( typeof $el == 'undefined' ) {
				$el = $(this);
			}
			
			if ( typeof app == 'undefined' ) {
				app = event.data;
			}
			
			let name = $el.attr('name'),
				newVal = $el.val(),
				refresh = false,
				refreshPanel = false;
			
			// checkbox 
			if ( $el.prop('type') == 'checkbox' ) {
				newVal = $el.prop('checked') ? 'on' : 'off';
			}
			
			// check number type min and max 
			if ( $el.attr('type') == 'number' && newVal == '' ) {
				
				if ( typeof $el.attr('min') !== 'undefined' ) {
					newVal = $el.attr('min');
				} else if ( typeof $el.attr('max') !== 'undefined' ) {
					newVal = $el.attr('max');
				}
			}
			
			// check settings panel 
			if ( $el.closest('#epkb-editor-settings-panel-hidden').length > 0 ) {
				
				// wrong configs 
				if ( typeof app.currentSettings[name] == 'undefined' ) {
					return;
				}
				
				// update value 
				if ( newVal == 'on' ) {
					// turn on 
					for ( let optionName in app.currentSettings[name].disabled_settings ) {
						let optionsList = app.getOptionsList( optionName );
						
						if ( optionsList.length < 1 ) {
							continue;
						}
						
						if ( app.currentSettings[name].disabled_settings[optionName] == optionsList[0] ) {
							app.updateOption( optionName, optionsList[1] );
						} else {
							app.updateOption( optionName, optionsList[0] );
						}
					}
					
					// set zone that should be checked after reload 
					app.preselectZone = name;
					
				} else {
					// turn off 
					
					for ( let optionName in app.currentSettings[name].disabled_settings ) {
						app.updateOption( optionName, app.currentSettings[name].disabled_settings[optionName] );
					}
				}
				
				// reload iframe (zone will be selected after reload)
				app.refreshIframe( app );
				
				return;
			}
			
			// check dimensions 
			if ( $el.closest('.epkb-editor-settings-control-type-dimensions').length > 0 ) {
				
				let groupName = $el.closest('.epkb-editor-settings-control-type-dimensions').data('field');
				let isLinked = $el.closest('.epkb-editor-settings-control-type-dimensions').find('.epkb-editor-settings-control__input__linking').hasClass('epkb-editor-settings-control__input__linking--active')
				
				for ( let settingGroupSlug in app.currentSettings ) {
					
					if ( typeof app.currentSettings[settingGroupSlug].settings[groupName] == 'undefined' ) {
						continue;
					}
					
					// something went wrong 
					if ( typeof app.currentSettings[settingGroupSlug].settings[groupName].subfields[name] == 'undefined' ) {
						continue; 
					}
					
					app.currentSettings[settingGroupSlug].settings[groupName].subfields[name].value = newVal;
					
					if ( typeof app.currentSettings[settingGroupSlug].settings[groupName].subfields[name].reload !== 'undefined' ) {
						refresh = true;
					}
					
					if ( ! isLinked ) {
						continue;
					}
					
					// if linked set all neibors values the same 
					$el.closest('.epkb-editor-settings-control-type-dimensions').find('input').val( newVal );
					
					for ( let fieldName in app.currentSettings[settingGroupSlug].settings[groupName].subfields ) {
						app.currentSettings[settingGroupSlug].settings[groupName].subfields[fieldName].value = newVal;
					}
					
				}
			} 
			
			// check multiple 
			if ( $el.closest('.epkb-editor-settings-control-type-multiple').length > 0 ) {
				
				let groupName = $el.closest('.epkb-editor-settings-control-type-multiple').data('field');
				
				for ( let settingGroupSlug in app.currentSettings ) {
					
					if ( typeof app.currentSettings[settingGroupSlug].settings[groupName] == 'undefined' ) {
						continue;
					}
					
					// something went wrong 
					if ( typeof app.currentSettings[settingGroupSlug].settings[groupName].subfields[name] == 'undefined' ) {
						continue; 
					}
					
					app.currentSettings[settingGroupSlug].settings[groupName].subfields[name].value = newVal;
					
					if ( typeof app.currentSettings[settingGroupSlug].settings[groupName].subfields[name].reload !== 'undefined' ) {
						refresh = true;
					}					
				}
			} 
			
			// check search presets
			if ( name == 'advanced_search_presets' && typeof epkb_editor_addon_data !== 'undefined' && typeof epkb_editor_addon_data.asea_presets !== 'undefined' && typeof epkb_editor_addon_data.asea_presets[newVal] !== 'undefined' ) {
				for ( let fieldName in epkb_editor_addon_data.asea_presets[newVal] ) {
					app.updateOption( fieldName, epkb_editor_addon_data.asea_presets[newVal][fieldName] );
				}
				
				refreshPanel = true;
				refresh = true;
			}
			
			// check themes 
			if ( name == 'theme_presets' && typeof app.theme_presets  !== 'undefined' && ( newVal == 'current' || typeof app.theme_presets [newVal] !== 'undefined' ) ) {
				// store old values in the current state 

				if ( typeof app.theme_presets.current == 'undefined' ) {
					app.theme_presets.current = {};
				}
				
				for ( let fieldName in app.theme_presets[newVal] ) {
					if ( typeof app.theme_presets.current[fieldName] == 'undefined' ) {
						app.theme_presets.current[fieldName] = app.getOption(fieldName);
					}
					
					app.updateOption( fieldName, app.theme_presets[newVal][fieldName] );
				} 
				
				refreshPanel = true;
				refresh = true;
			}
			
			for ( let settingGroupSlug in app.currentSettings ) {
				if ( typeof app.currentSettings[settingGroupSlug].settings[name] == 'undefined' ) {
					continue;
				}

				app.currentSettings[settingGroupSlug].settings[name].value = newVal;
				
				if ( typeof app.currentSettings[settingGroupSlug].settings[name].reload !== 'undefined' ) {
					refresh = true;
				}
			}
			
			if ( epkb_editor.page_type == 'article-page' ) {
				
				let leftSidebar = app.currentSettings.left_sidebar.settings,
				leftSidebarWidthDesktop = app.isLeftPanelActive() ? leftSidebar['article-left-sidebar-desktop-width-v2'].value : 0,
				//leftSidebarWidthTablet = app.iframe.find('#eckb-article-left-sidebar div').length ? leftSidebar['article-left-sidebar-tablet-width-v2'].value : 0,
				
				rightSidebar = app.currentSettings.right_sidebar.settings,
				rightSidebarWidthDesktop = app.isRightPanelActive() ? rightSidebar['article-right-sidebar-desktop-width-v2'].value : 0,
				//rightSidebarWidthTablet = app.iframe.find('#eckb-article-right-sidebar div').length ? rightSidebar['article-right-sidebar-tablet-width-v2'].value : 0,
				
				articleColumnSettings = [
					'article-right-sidebar-desktop-width-v2',
					'article-right-sidebar-tablet-width-v2',
					'article-left-sidebar-desktop-width-v2',
					'article-left-sidebar-tablet-width-v2',
				];
				
				if ( ~articleColumnSettings.indexOf( name ) ) {
					// recalculate content area 
					app.currentSettings.article_content.settings['article-content-desktop-width-v2'].value = 100 - leftSidebarWidthDesktop - rightSidebarWidthDesktop;
					//app.currentSettings.article_content.settings['article-content-tablet-width-v2'] = 100 - leftSidebarWidthTablet - rightSidebarWidthTablet;
				}
				
			}
			
			if ( typeof app.currentEditorSettings.settings_zone.settings[name] != 'undefined' ) {
				app.currentEditorSettings.settings_zone.settings[name].value = newVal;
				
				if ( typeof app.currentEditorSettings.settings_zone.settings[name].reload !== 'undefined' ) {
					refresh = true;
				}
			}
			
			app.checkTogglers();
			app.updateStyles();
			app.updateAttributes();
			app.updateText();
			
			if ( refresh ) {
				app.refreshIframe( app );
			}
			
			if ( refreshPanel ) {
				app.refreshPanel( app );
			}
			
			// check if zone become disabled 
			for ( let zoneName in app.currentSettings ) {
				
				// exclude search for this feature 
				if ( zoneName == 'search_box_zone' ) {
					continue;
				}
				
				let zone = app.currentSettings[zoneName], 
				    is_on = false;
					
				if ( typeof zone.disabled_settings == 'undefined' || typeof zone.disabled_settings[name] == 'undefined' ) {
					continue;
				}
				
				for ( let fieldName in zone.disabled_settings ) {
					let optionValue = app.getOption( fieldName );
					let conditionValue = zone.disabled_settings[fieldName];
					
					if ( optionValue != conditionValue ) {
						is_on = true;
					}
				}
				
				// dont show activated zones
				if ( is_on ) {
					continue;
				}
				
				app.showNavigation( true );
			}
		},
		
		addField: function( fieldName, field ) {
			
			// check type, see EPKB_Input_Filter class 				
				switch ( field.type ) {
					case 'color_hex':
						this.addColorPicker( fieldName, field );
						break;
					case 'text':
						this.addText( fieldName, field );
						break;
					case 'wp_editor': 
						this.addWpEditor( fieldName, field );
						break;
					case 'header':
						this.addHeader( fieldName, field );
						break;
					case 'header_desc':
						this.addheader_desc( fieldName, field );
						break;
					case 'select':
					case 'preset':
						this.addSelect( fieldName, field );
						break;
					case 'divider':
						this.addDivider( fieldName, field );
						break;
					case 'checkbox':
						this.addCheckbox( fieldName, field );
						break;	
					case 'number':
						this.addNumber( fieldName, field );
						break;
					case 'units':
						this.addUnits( fieldName, field );
						break;
					case 'raw_html':
						this.addRawHtml( fieldName, field );
						break;
						
					// TODO add 
					
					// notice - when will need it 
				}
				
				switch( field.group_type ) {
					case 'dimensions':
						this.addDimensions( fieldName, field );
						break;
					case 'multiple': 
						this.addMultiple( fieldName, field );
						break;
				}
		},
		
		addHeader: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.header( {
				name: fieldName,
				content: field.content,
			} ) );
		},

		addheader_desc: function( fieldName, field) {

			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}

			el.append( EPKBEditorTemplates.header_desc( {
				title: field.title,
				desc: field.desc,
				name: fieldName
			} ) );
		},

		addText: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.text( {
				name: fieldName,
				label: field.label,
				value: field.value,
				style: field.style,
				separator_above: field.separator_above,
				html: ( typeof field.html != 'undefined' ),
				info_url: ( typeof field.info_url == 'undefined' ) ? '' : field.info_url,
				description: ( typeof field.description == 'undefined' ) ? '' : field.description
			} ) );
		},

		addNumber: function( fieldName, field ) {

			let data = {
				name: fieldName,
				label: field.label,
				value: field.value,
				style: field.style,
				separator_above: field.separator_above,
				info_url: ( typeof field.info_url == 'undefined' ) ? '' : field.info_url,
				description: ( typeof field.description == 'undefined' ) ? '' : field.description
			};

			if ( typeof field.style != 'undefined' ) {
				data.style = field.style;
			}

			if ( typeof field.max != 'undefined' ) {
				data.max = field.max;
			}

			if ( typeof field.min != 'undefined' ) {
				data.min = field.min;
			}

			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.number( data ) );
		},
		
		addUnits: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.units( {
				name: fieldName,
				value: field.value,
				options: field.options,
			} ) );
		},

		addDimensions: function( fieldName, field ) {
			// here can be only 4 inputs one by one
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.dimensions( {
				name: fieldName,
				label: field.label,
				subfields: field.subfields,
				units: ( typeof field.units == 'undefined' ) ? '' : field.units,
				linked: ( typeof field.linked == 'undefined' ) ? '' : field.linked,
				info_url: ( typeof field.info_url == 'undefined' ) ? '' : field.info_url,
				description: ( typeof field.description == 'undefined' ) ? '' : field.description
			} ) );
		},
		
		addMultiple: function ( fieldName, field ) {
			let $wrapper = $(`<div class="epkb-editor-settings-control-type-multiple" data-field="${fieldName}"></div>`);
			$( '#epkb-editor-settings-panel-' + field.editor_tab ).append($wrapper);
			
			for ( let subfieldName in field.subfields ) {
				field.subfields[subfieldName].editor_tab = field.editor_tab;
				field.subfields[subfieldName].element_wrapper = $wrapper;
				this.addField( subfieldName, field.subfields[subfieldName] );
			}
		},
		
		addSelect: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			if ( typeof field.value == 'undefined' ) {
				field.value = field.default;
			}
			
			el.append( EPKBEditorTemplates.select( {
				name: fieldName,
				label: field.label,
				value: field.value,
				style: field.style,
				options: field.options,
				separator_above: field.separator_above,
				info_url: ( typeof field.info_url == 'undefined' ) ? '' : field.info_url,
				description: ( typeof field.description == 'undefined' ) ? '' : field.description

			} ) );
			
			if ( field.style == 'prev-next' ) {
				let $select = el.find( '[name=' + fieldName + ']' );
				
				if ( $select.val() == $select.find('option').first().val() ) {
					$select.parent().find('.epkb-editor-settings-control-type-select--prev-button').css({ 'visibility' : 'hidden' });
				}
				
				if ( $select.val() == $select.find('option').last().val() ) {
					$select.parent().find('.epkb-editor-settings-control-type-select--next-button').css({ 'visibility' : 'hidden' });
				}
			}
		},

		addCheckbox: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.checkbox( {
				name: fieldName,
				label: field.label,
				value: field.value,
				separator_above: field.separator_above,
				info_url: ( typeof field.info_url == 'undefined' ) ? '' : field.info_url,
				description: ( typeof field.description == 'undefined' ) ? '' : field.description

			} ) );
		},

		addColorPicker: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.colorPicker( {
				name: fieldName,
				label: field.label,
				value: field.value,
				separator_above: field.separator_above,
				info_url: ( typeof field.info_url == 'undefined' ) ? '' : field.info_url,
				description: ( typeof field.description == 'undefined' ) ? '' : field.description
			} ) );
		},

		addDivider: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.divider() );
		},
		
		addWpEditor: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.wpEditor( {
				name: fieldName,
				label: field.label,
				value: field.value,
				info_url: ( typeof field.info_url == 'undefined' ) ? '' : field.info_url,
				description: ( typeof field.description == 'undefined' ) ? '' : field.description
			} ) );
		},
		
		showWpEditor: function ( event ) {
			
			let app = event.data;
			
			let fieldName = $(this).closest('.epkb-editor-settings-control-type-wp-editor').data('field');
			
			// get value from fieldName 
			let text = app.getOption( fieldName );
			
			// fill value to the editor 
			
			if ( ! tinymce.get('epkbeditormce') ) {
				$('.epkb-editor-popup .wp-editor-wrap .switch-tmce').trigger('click');
			}
			
			tinymce.get('epkbeditormce').setContent( text );

			// set what field do we edit 
			$('#epkbeditormce').data( 'fieldName', fieldName );
			
			// update title of the popup 
			$('.epkb-editor-popup__header').text( $('textarea[name=' + fieldName + ']').closest( '.epkb-editor-settings-control__field' ).find('.epkb-editor-settings-control__title').text() );
			
			// show editor 
			$('.epkb-editor-popup').addClass( 'epkb-editor-popup--active' );
			
			return false;
		},
		
		onSaveWpEditor: function ( event ) {
			
			let app = event.data;
			
			// get field 
			let text = tinymce.get('epkbeditormce').getContent();
			let fieldName = $('#epkbeditormce').data( 'fieldName' );
			
			// save
			$('textarea[name=' + fieldName + ']').val( text );
			
			// hide popup 
			$('.epkb-editor-popup').removeClass( 'epkb-editor-popup--active' );
			
			// trigger update 
			$('textarea[name=' + fieldName + ']').trigger('change');
		},
		
		onCancelWpEditor: function () {
			// just hide editor 
			$('.epkb-editor-popup').removeClass( 'epkb-editor-popup--active' );
		},
		
		addRawHtml: function( fieldName, field ) {
			
			let el;
			if ( typeof field.element_wrapper == 'undefined' ) {
				el = $( '#epkb-editor-settings-panel-' + field.editor_tab );
			} else {
				el =  field.element_wrapper;
			}
			
			el.append( EPKBEditorTemplates.rawHtml( {
				name: fieldName,
				content: field.content,
			} ) );
		},
		
		/*******  ZONE CHANGE   ********/

		onZoneClick: function( event, param ){
			
			let zone, app;
			
			// new zone 
			if ( typeof event !== 'undefined' ) {
				event.stopPropagation();
				zone = $(this).data('zone'),
				app = event.data;
			// just update current 
			} else {
				app = this;
				zone = app.activeZone;
			}
			
			$( 'body' ).trigger( 'click.epkbcolorpicker' );
			
			// fake click to open panel/tab/etc
			if ( typeof param !== 'undefined' && ! param ) {
				return;
			}
		
			app.showMenuButtons();
			
			// Remove all active zone classes
			app.iframe.find( '.epkb-editor-zone' ).removeClass( 'epkb-editor-zone--active' );
			app.iframe.find( '.epkb-editor-zone--active-visibility' ).removeClass( 'epkb-editor-zone--active-visibility' );
			
			// Add Class to clicked on Zone
			$( this ).addClass( 'epkb-editor-zone--active' );
			$( this ).find( '.epkb-editor-zone.hover' ).removeClass('hover');
			app.iframe.find( '.epkb-editor-zone__tabs').remove();
			
			// clear modal 
			app.clearModal();
			
			// clear current theme only for the openned page zone first time, not reload
			if ( zone != app.activeZone && typeof app.theme_presets != 'undefined' ) {
				delete app.theme_presets.current;
			}
			
			// update header
			if ( typeof app.currentSettings[zone] != 'undefined' && typeof app.currentSettings[zone].title != 'undefined' ) {
				$('.epkb-editor-header__inner__title').html(app.currentSettings[zone].title);
			}
			
			
			if (typeof app.currentSettings[zone] == 'undefined') {
				$('.epkb-editor-header__inner__title').html( epkb_editor.epkb_name );
				$('.epkb-editor-settings__panel-content-container').append( EPKBEditorTemplates.notice( { 'title' : epkb_editor.no_settings } ) );
				app.activeZone = '';
				
				return true;
			}
			
			// set active zone 
			app.activeZone = zone;
			
			// add tabs 
			let tabs = [];
			
			for ( let fieldName in app.currentSettings[zone].settings ) {
				
				if ( ~tabs.indexOf( app.currentSettings[zone].settings[fieldName].editor_tab ) ) {
					continue;
				}
				
				tabs.push( app.currentSettings[zone].settings[fieldName].editor_tab );
			}
			
			// add tabs buttons on the top
			$('.epkb-editor-settings__panel-navigation-container').append( EPKBEditorTemplates.modalTabsHeader( tabs ) );
			
			for ( let fieldName in app.currentSettings[zone].settings ) {
				app.addField( fieldName, app.currentSettings[zone].settings[fieldName] );
			}
			
			// change active tab if needed, content by default
			if ( ! $('#epkb-editor-settings-panel-content').html() ) {
				$('#epkb-editor-settings-panel-content').removeClass('epkb-editor-settings__panel--active');
				$('#epkb-editor-settings-panel-' + tabs[0]).addClass('epkb-editor-settings__panel--active');	
			}
			
			if ( typeof event !== 'undefined' ) {
				
				if ( zone == 'search_input_zone' ) {
					app.addTabsToZone( $(this).parent() );
					$(this).parent().addClass('epkb-editor-zone--active-visibility');
				} else {
					app.addTabsToZone( $(this) );
				}
				
			}
			
			app.activateColorPickers();
			app.activateSliders();
			app.checkTogglers();
			app.showModal();
			app.loadThemes();
		},
		
		// add tabs to active zone 
		addTabsToZone: function( activeZoneEl, zone ) {
			
			let activeZone = '';
			
			this.iframe.find('.epkb-editor-zone__tabs').remove();
			
			if ( ! this.activeZone && typeof zone == 'undefined' ) {
				return;
			}
			
			if ( typeof zone == 'undefined' ) {
				activeZone = this.activeZone;
			} else {
				activeZone = zone;
			}
			
			
			let activeZoneName = this.currentSettings[ activeZone ].zone_tab_title;
			
			if ( typeof activeZoneName == 'undefined' ) {
				activeZoneName = this.currentSettings[ activeZone ].title;
			}
			
			let tabHTML = `
				<div class="epkb-editor-zone__tabs">
					<div class="epkb-editor-zone__tab--active">${activeZoneName}</div>
			`;
			
			let parentZoneEl = activeZoneEl.parents( '.epkb-editor-zone' ).eq(0);
			
			if ( typeof zone == 'undefined' && parentZoneEl.length && typeof this.currentSettings[ parentZoneEl.data('zone') ].parent_zone_tab_title !== 'undefined' ) {
				
				tabHTML += `<div class="epkb-editor-zone__tab--parent" data-zone="${parentZoneEl.data('zone')}">${this.currentSettings[ parentZoneEl.data('zone') ].parent_zone_tab_title}<span class="epkb-editor-zone__tab--parent-icon epkbfa epkbfa-arrow-up"></span></div>`;
			}
			
			tabHTML += `</div>`;
			
			activeZoneEl.append( tabHTML );
		},
		
		toggleLinkedDimensions( event ) {
			if ( $(this).hasClass('epkb-editor-settings-control__input__linking--active') ) {
				$(this).removeClass('epkb-editor-settings-control__input__linking--active');
				return true;
			}
			
			let firstField = $(this).closest('.epkb-editor-settings-control__fields').find('input').first();
			$(this).addClass('epkb-editor-settings-control__input__linking--active');
			
			$(this).closest('.epkb-editor-settings-control__fields').find('input').val( firstField.val() );
			firstField.change();
		},
		
		updateStyles: function() {
			// clear old styles
			this.styles.html('');

			for ( let settingGroupSlug in this.currentSettings ) {
				
				
				for ( let fieldName in this.currentSettings[settingGroupSlug].settings ) {
					let field = this.currentSettings[settingGroupSlug].settings[fieldName];
					
					// check togglers 
					if ( typeof field.toggler == 'string' ) {
						let togglerOption = this.getOption(field.toggler);
						
						if ( togglerOption == 'off' ) {						
							continue;
						}
					} else if ( typeof field.toggler == 'object' ) {
						// object, for selects 
						let togglerState = true;
							
						for ( let togglerFieldName in field.toggler ) {
							let togglerOption = this.getOption(togglerFieldName);
								
							if ( togglerOption !== field.toggler[togglerFieldName] ) {
								togglerState = false;
							}
						}
							
						if ( ! togglerState ) {
							continue;
						}
					}
					
					let important = '!important';
					
					if ( typeof field.style_important !== 'undefined' && ! field.style_important ) {
						important = '';
					}
					
					// dimensions field
					if ( field.group_type == 'dimensions' ) {
						
						for ( let subfieldName in field.subfields ) {
							let subfield = field.subfields[subfieldName];
							
							if ( typeof subfield.styles != 'undefined' ) {
								for ( let selector in subfield.styles ) {
									this.styles.append(`
										${selector} {
											${subfield.styles[selector]}: ${subfield.value}${ this.getPostfix( subfield.postfix ) }${important};
										}
									`);
								}
							}
							
							if ( typeof subfield.target_selector == 'undefined' || typeof subfield.style_name == 'undefined' ) {
								continue;
							}
							
							this.styles.append(`
								${subfield.target_selector} {
									${subfield.style_name}: ${subfield.value}${ this.getPostfix( subfield.postfix ) }${important};
								}
							`);
						}
						
						continue;
					}
					
					// dimensions field
					if ( field.group_type == 'multiple' ) {

						if ( typeof field.style_template != 'string' || typeof field.target_selector == 'undefined' || typeof field.style_name == 'undefined' ) {
							continue;
						}
						
						let cssRule = field.style_template;
						
						for ( let subfieldName in field.subfields ) {
							let subfield = field.subfields[subfieldName];
							
							cssRule = cssRule.replace( subfieldName, subfield.value + this.getPostfix( subfield.postfix ) );
						}
						
						this.styles.append(`
							${field.target_selector} {
								${field.style_name}: ${cssRule}${important};
							}
						`);
					}
					
					if ( typeof field.styles != 'undefined' ) {
						for ( let selector in field.styles ) {
							this.styles.append(`
								${selector} {
									${field.styles[selector]}: ${field.value}${ this.getPostfix( field.postfix ) }${important};
								}
							`);
						}
					}
					
					if ( typeof field.target_selector == 'undefined' || typeof field.style_name == 'undefined' ) {
						continue;
					}
					
					this.styles.append(`
						${field.target_selector} {
							${field.style_name}: ${field.value}${ this.getPostfix( field.postfix ) }${important};
						}
					`);
				}
			}
			
			// check article columns 
			if ( epkb_editor.page_type == 'article-page' ) {
				
				let leftSidebar = this.currentSettings.left_sidebar.settings,
					rightSidebar = this.currentSettings.right_sidebar.settings,
					leftSidebarWidthDesktop = 0,
					rightSidebarWidthDesktop = 0,
					contentWidthDesktop;
				
				if ( this.isLeftPanelActive() ) {
					leftSidebarWidthDesktop = leftSidebar['article-left-sidebar-desktop-width-v2'].value ? leftSidebar['article-left-sidebar-desktop-width-v2'].value : 20;
				}
				
				if ( this.isRightPanelActive() ) {
					rightSidebarWidthDesktop = rightSidebar['article-right-sidebar-desktop-width-v2'].value ? rightSidebar['article-right-sidebar-desktop-width-v2'].value : 20;
				}
			
				contentWidthDesktop = 100 - leftSidebarWidthDesktop - rightSidebarWidthDesktop;
				
				// resave content width if it is not true 
				this.currentSettings.left_sidebar.settings['article-left-sidebar-desktop-width-v2'].value = leftSidebarWidthDesktop;
				this.currentSettings.right_sidebar.settings['article-right-sidebar-desktop-width-v2'].value = rightSidebarWidthDesktop;
				this.currentSettings.article_content.settings['article-content-desktop-width-v2'].value = contentWidthDesktop;
				
				this.styles.append(`
						#eckb-article-page-container-v2 #eckb-article-body {
							grid-template-columns: ${leftSidebarWidthDesktop}% ${contentWidthDesktop}% ${rightSidebarWidthDesktop}%!important;
						}
					`);
			}

		},

		updateAttributes: function() {

			for ( let settingGroupSlug in this.currentSettings ) {
				for ( let fieldName in this.currentSettings[settingGroupSlug].settings ) {
					let field = this.currentSettings[settingGroupSlug].settings[fieldName];

					if ( typeof field.target_attr == 'undefined' ) {
						continue;
					}
					
					// check togglers 
					if ( typeof field.toggler == 'string' ) {
						let togglerOption = this.getOption(field.toggler);
						
						if ( togglerOption == 'off' ) {						
							continue;
						}
					} else if ( typeof field.toggler == 'object' ) {
						// object, for selects 
						let togglerState = true;
							
						for ( let togglerFieldName in field.toggler ) {
							let togglerOption = this.getOption(togglerFieldName);
								
							if ( togglerOption !== field.toggler[togglerFieldName] ) {
								togglerState = false;
							}
						}
							
						if ( ! togglerState ) {
							continue;
						}
					}
					
					let attributes = field.target_attr.split('|');

					for ( let attribute of attributes ) {
						this.iframe.find(field.target_selector).prop( attribute, field.value );
					}

				}
			}
		},

		updateText: function() {

			for ( let settingGroupSlug in this.currentSettings ) {
				for ( let fieldName in this.currentSettings[settingGroupSlug].settings ) {
			
					let field = this.currentSettings[settingGroupSlug].settings[fieldName];
					
					// check togglers 
					if ( typeof field.toggler == 'string' ) {
						let togglerOption = this.getOption(field.toggler);
						
						if ( togglerOption == 'off' ) {						
							continue;
						}
					} else if ( typeof field.toggler == 'object' ) {
						// object, for selects 
						let togglerState = true;
							
						for ( let togglerFieldName in field.toggler ) {
							let togglerOption = this.getOption(togglerFieldName);
								
							if ( togglerOption !== field.toggler[togglerFieldName] ) {
								togglerState = false;
							}
						}
							
						if ( ! togglerState ) {
							continue;
						}
					}
					
					if ( typeof field.text != 'undefined' ) {
						this.iframe.find(field.target_selector).text( this.decodeHtml(field.value) );
					}

					if ( typeof field.html != 'undefined' ) {
						this.iframe.find(field.target_selector).html( field.value );
					}
				}
			}
		},
		
		checkTogglers: function() {
			// check active inputs and togglers in modal 
			if ( this.activeZone == '' || typeof this.currentSettings[this.activeZone] == 'undefined' ) {
				return;
			}
			
			for ( let fieldName in this.currentSettings[this.activeZone].settings ) {

				let field = this.currentSettings[this.activeZone].settings[fieldName];
				
				if ( typeof field.toggler == 'undefined' ) {
					continue;
				}

				let togglerState = false;

				if ( typeof field.toggler == 'string' ) {
					togglerState = ( this.getOption(field.toggler) == 'on' ); 
				}

				if ( typeof field.toggler == 'object' ) {
					// object, for selects 
					togglerState = true;
					for ( let togglerFieldName in field.toggler ) {
						let togglerOption = this.getOption(togglerFieldName);

						// check ! 
						if ( field.toggler[togglerFieldName][0] == '!' ) {
							if ( togglerOption == field.toggler[togglerFieldName].substring(1) ) {
								togglerState = false;
							}
						} else {
							if ( togglerOption !== field.toggler[togglerFieldName] ) {
								togglerState = false;
							}
						}
						
					}
					
				}
				
				if ( togglerState ) {
					$('[data-field='+fieldName+']').show();
					$('[data-separator='+fieldName+']').show();
				} else {
					$('[data-field='+fieldName+']').hide();
					$('[data-separator='+fieldName+']').hide();
				}
			}
		},

		refreshIframe: function( app ) {
			
			app.showLoader();
			
			// add form to add POST parameters during reload the iframe
			if ( app.iframe.find('#epkb-settings-form').length == 0 ) {
				app.iframe.find('body').append(`
					<form id="epkb-settings-form" method="post">
						<input type="hidden" name="epkb-editor-settings">
						<input type="hidden" name="epkb-editor" value="1">
						<input type="hidden" name="epkb-editor-kb-id" value="${epkb_editor.epkb_editor_kb_id}">
					</form>
				`);
			}
			
			let allSettings = Object.assign( {}, app.currentSettings, app.currentEditorSettings );
			
			for ( let settingZone in allSettings ) {
				for ( let fieldName in allSettings[settingZone].settings ) {
					delete allSettings[settingZone].settings[fieldName].element_wrapper;
				}
			}
			
			delete allSettings.themes;

			app.iframe.find('#epkb-settings-form input[name=epkb-editor-settings]').val( JSON.stringify( allSettings ) );
			app.iframe.find('#epkb-settings-form').submit();
		},
		
		refreshPanel: function() {
			
			let currentTab = $('.epkb-editor-settings__panel-navigation__tab--active').data('target');
			let currentScroll = $('.epkb-editor-settings__panel-content-container').scrollTop();
			
			this.onZoneClick();
			
			$('#epkb-editor-settings-tab-' + currentTab).click();
			$('.epkb-editor-settings__panel-content-container').scrollTop( currentScroll );
		},

		activateColorPickers: function() {
			if ( $('#epkb-editor').find('.epkb-editor-settings-control-type-color input').length && typeof $('#epkb-editor').find('.epkb-editor-settings-control-type-color input').epkbColorPicker == 'function' ) {
				$('#epkb-editor').find('.epkb-editor-settings-control-type-color input').epkbColorPicker({
					change: function( colorEvent, ui) {
						setTimeout( function() {
							$( colorEvent.target).trigger('change');
						}, 50);
					},
					// a callback to fire when the input is emptied or an invalid color
					clear: function( event, ui) {
						let input = $(event.target).closest('.epkb-editor-settings-control__input').find('.epkb-picker-input-wrap label input[type=text]');
						
						if ( input.length < 1 ) {
							return;
						}
						
						if ( typeof input.data('default_color') == 'undefined' ) {
							return;
						}
						
						input.iris('color', input.data('default_color'));
					}
				});
			}
		},
		
		activateSliders: function() {
			$( ".epkb-editor-settings-control-type-number--slider .epkb-editor-settings-control__slider" ).each(function(){
				
				let input = $(this).closest('.epkb-editor-settings-control-container').find('input');
				let that = $(this);
				
				that.slider({
					max: parseFloat(input.prop('max')),
					min: parseFloat(input.prop('min')),
					value: parseFloat(input.val()),
					change: function( event, ui ){
						input.val( ui.value );
						input.trigger( 'change', [ 'updateSlider' ] );
					},
				});
				
				input.change(function( event, type ){
					if ( type == 'updateSlider' ) {
						return true;
					}
					
					that.slider( 'option', 'value', parseFloat($(this).val()) );
				});
			});
		},
		
		loadThemes: function() {
			let app = this;
			
			if ( $('[name=theme_presets]').length == 0 || typeof app.theme_presets != 'undefined') {
				return;
			}
			
			// load with ajax 
			let postData = {
				action: 'eckb_editor_get_themes_list',
				_wpnonce_apply_editor_changes: epkb_editor._wpnonce_apply_editor_changes,
			};
			
			$.ajax({
				type: 'POST',
				dataType: 'json',
				data: postData,
				url: epkb_editor.ajaxurl,
				beforeSend: function (xhr) {
					$('[name=theme_presets]').prop('disabled', 'disabled');
				}
			}).done(function (response) {
				
				app.theme_presets = response.data;

			}).fail(function (response, textStatus, error) {
				let msg = ( error ? error : 'unknown error' );
				app.showMessage({
					text: msg,
					type: 'error'
				});
			}).always(function () {
				$('[name=theme_presets]').prop('disabled', false);
			});

		},
		
		/*******  MODAL SHOW/HIDE   ********/
		toggleMode: function( event ){
			let app = event.data;
			
			if ( $('body').hasClass( 'epkb-edit-mode' ) ) {
				
				// remove preopen parameter and reload
				let rtn = location.href.split( '?' )[0],
					param,
					params_arr = [],
					queryString = ( location.href.indexOf( '?' ) !== -1 ) ? location.href.split( '?' )[1] : '';
					
				if ( queryString !== '' ) {
					params_arr = queryString.split( '&' );
					for ( var i = params_arr.length - 1; i >= 0; i -= 1 ) {
						param = params_arr[i].split( '=' )[0];
						
						if ( param === 'preopen' ) {
							params_arr.splice( i, 1 );
						}
						
						if ( param === 'action' ) {
							params_arr.splice( i, 1 );
						}
						
					}
					rtn = rtn + '?' + params_arr.join( '&' );
				}

				if ( location.href == rtn ) {
					location.reload();
				} else {
					location.href = rtn;
				}
				
			} else {
				$('body').addClass( 'epkb-edit-mode' );
				app.showModal();
			}
		},
		
		showModal: function(){
			$('body').addClass('epkb-editor--active');
			$('#epkb-editor-iframe').show();
		},

		hideModal: function(){
			$('body').removeClass('epkb-editor--active');
		},
		
		/*******  MESSAGES/LOADER SETTINGS   ********/

		showLoader: function(){
			$('.epkb-frontend-loader').addClass('epkb-frontend-loader--active'); 
		},
		
		removeLoader: function(){
			setTimeout( function() {
				$('.epkb-frontend-loader').removeClass('epkb-frontend-loader--active'); 
			}, 200);
		},
		
		showMessage: function( data = {} ) {
			
			let message = '';
			
			if ( typeof data.html == 'undefined' ) {
				message = EPKBEditorTemplates.message( data );
			} else {
				message = data.html;
			}
			
			$('body>.eckb-bottom-notice-message').remove();

			$('body').append( message );
			$('body').addClass('epkb-showing-message');
			
			if ( typeof data.timeout == 'undefined' ) {
				data.timeout = 60000;
			}
			
			setTimeout(function(){
				$('body>.eckb-bottom-notice-message').remove();
				$('body').removeClass('epkb-showing-message');
			}, data.timeout );
		},

		/**** Decode HTML ******/
		decodeHtml: function( html )  {
			var txt = document.createElement("textarea");
			txt.innerHTML = html;
			return txt.value;
		},

		/*******  SAVE SETTINGS   ********/
		
		saveSettings: function( event ) {
			
			event.preventDefault();
			
			let app = event.data;
			let config = {};
			let allSettings = Object.assign( {}, app.currentSettings, app.currentEditorSettings );
			
			delete allSettings.themes;
			
			for ( let zone in allSettings ) {
				let settings = allSettings[zone].settings;
				
				for ( let fieldName in settings ) {
					let field = settings[fieldName];
					
					if ( typeof field.group_type == 'undefined' ) {
						// simple field 
						config[fieldName] = field.value;
					} else {
						// group type 
						for ( let subfieldName in field.subfields ) {
							config[subfieldName] = field.subfields[subfieldName].value;
						}
					}
				}
			}
			
			let postData = {
				action: 'eckb_apply_editor_changes',
				_wpnonce_apply_editor_changes: epkb_editor._wpnonce_apply_editor_changes,
				kb_config: config,
				epkb_editor_kb_id: epkb_editor.epkb_editor_kb_id,
				page_type: epkb_editor.page_type
			};
			
			$.ajax({
				type: 'POST',
				dataType: 'json',
				data: postData,
				url: epkb_editor.ajaxurl,
				beforeSend: function (xhr) {
					app.showLoader();
				}
			}).done(function (response) {
				
				if ( typeof response.error == 'undefined' ) {
					// success 
					app.showMessage({
						text: response.message
					});
					
				} else {
					app.showMessage({
						html: response.message,
						type: 'error'
					});
				}

			}).fail(function (response, textStatus, error) {
				let msg = ( error ? error : 'unknown error' );
				app.showMessage({
					text: msg,
					type: 'error'
				});
			}).always(function () {
				app.removeLoader();
			});
		},
	
		/******* SETTINGS ********/
		
		showMenu: function ( event ) {
			let app = event.data;
			event.stopPropagation();
			$( 'body' ).trigger( 'click.epkbcolorpicker' );
			
			// clear modal 
			app.clearModal();
			
			// update header
			$('.epkb-editor-header__inner__title').html( epkb_editor.epkb_name );
			
			// hide tabs 
			$( '.epkb-editor-settings__panel-navigation-container, .epkb-editor-settings__panel-content-container' ).hide();
			
			// show menu 
			$( '.epkb-editor-settings-menu-container' ).show();
			
			app.showBackButtons();
			
			// change active zone 
			app.activeZone = 'menu';
		},
		
		showSettings: function( event ) {
			
			event.stopPropagation();
			
			$( 'body' ).trigger( 'click.epkbcolorpicker' );
			
			let app = event.data;

			// clear modal 
			app.clearModal();
			
			// update header
			$('.epkb-editor-header__inner__title').html( epkb_editor.epkb_name );
			
			// add tabs buttons on the top
			$('.epkb-editor-settings__panel-navigation-container').append( EPKBEditorTemplates.modalTabsHeaderSettings() );
			
			// make active global tab 
			$('#epkb-editor-settings-panel-content').removeClass('epkb-editor-settings__panel--active');
			$('#epkb-editor-settings-panel-global').addClass('epkb-editor-settings__panel--active');
			
			// add global tab settings 
			$('#epkb-editor-settings-panel-global').append( epkb_editor.settings_html );
			
			// set active to template and layouts
			$('.epkb-editor-settings-control-image-select input[value='+epkb_editor_settings.settings_zone.settings.templates_for_kb.value+']').prop('checked', 'checked');
			$('.epkb-editor-settings-control-image-select input[value='+epkb_editor_settings.settings_zone.settings.kb_main_page_layout.value+']').prop('checked', 'checked');
			
			$('.epkb-editor-settings-panel-global__links-container').append(
				( epkb_editor.page_type == 'main-page' ? EPKBEditorTemplates.menuLinks( '#', 'templates', 'sliders', epkb_editor.theme_link ) : '' ) +
				( epkb_editor.page_type == 'main-page' ? EPKBEditorTemplates.menuLinks( '#', 'layouts', 'sitemap', epkb_editor.layouts_link ) : '' ) +
				EPKBEditorTemplates.menuLinks( epkb_editor.kb_url+'&page=epkb-kb-configuration&wizard-global', 'urls', 'globe', epkb_editor.urls_and_slug ) +
				EPKBEditorTemplates.menuLinks( epkb_editor.kb_url+'&page=epkb-kb-configuration&wizard-ordering', 'ordering', 'object-group', epkb_editor.order_categories_and_articles ) + 
				EPKBEditorTemplates.menuLinks( epkb_editor.kb_url+'&page=epkb-manage-kb', 'manage_kb', 'pencil-square-o', epkb_editor.rename_kb ) 
			);
			
			// add settings on the global tab 
			for ( let fieldName in app.currentEditorSettings.settings_zone.settings ) {
				let field = app.currentEditorSettings.settings_zone.settings[fieldName];
				field.element_wrapper = $('#epkb-editor-settings-panel-global');
				app.addField( fieldName, field );
			}

			app.showBackButtons();
			
			// change active zone 
			app.activeZone = 'settings';
		},
		
		/******* HELPERS ********/
		
		// get value of the option from current settings 
		getOption: function( optionName ) {
			
			for ( let settingGroupSlug in this.currentSettings ) {
				
				for ( let fieldName in this.currentSettings[settingGroupSlug].settings ) {
					
					let field = this.currentSettings[settingGroupSlug].settings[fieldName];
					
					if ( optionName == fieldName ) {
						
						return field.value;
					}
					
					if ( field.group_type == 'dimensions' || field.group_type == 'multiple' ) {
						
						if ( typeof field.subfields[optionName] == 'undefined' ) {
							continue;
						}
						
						return field.subfields[optionName].value;
						
					}
				}
			}
			
			for ( let settingGroupSlug in this.currentEditorSettings ) {
				
				for ( let fieldName in this.currentEditorSettings[settingGroupSlug].settings ) {
					
					let field = this.currentEditorSettings[settingGroupSlug].settings[fieldName];
					
					if ( optionName == fieldName ) {
						
						return field.value;
					}
					
				}
			}
			
			return false;
		},
		
		// update value of the option in current settings 
		updateOption: function( optionName, newVal ) {
			
			for ( let settingGroupSlug in this.currentSettings ) {
				
				for ( let fieldName in this.currentSettings[settingGroupSlug].settings ) {
					
					let field = this.currentSettings[settingGroupSlug].settings[fieldName];
					
					if ( optionName == fieldName ) {
						
						this.currentSettings[settingGroupSlug].settings[fieldName].value = newVal;
					}
					
					if ( field.group_type == 'dimensions' || field.group_type == 'multiple' ) {
						
						if ( typeof field.subfields[optionName] == 'undefined' ) {
							continue;
						}
						
						this.currentSettings[settingGroupSlug].settings[fieldName].subfields[optionName].value = newVal;
					}
				}
			}
			
			for ( let fieldName in this.currentEditorSettings.settings_zone.settings ) {
				if ( optionName == fieldName ) {			
					this.currentEditorSettings.settings_zone.settings[fieldName].value = newVal;
				}
			}
		},
		
		// Work for select and checkbox: return array of the possible settings 
		getOptionsList: function(optionName ) {
			
			let optionsList = [];
			
			for ( let settingGroupSlug in this.currentSettings ) {
				
				for ( let fieldName in this.currentSettings[settingGroupSlug].settings ) {
					
					let field = this.currentSettings[settingGroupSlug].settings[fieldName];
					
					if ( optionName == fieldName && field.type == 'checkbox' ) {
						return [ 'on', 'off' ];
					}
					
					if ( optionName == fieldName && ( field.type == 'select' || field.type == 'preset' ) ) {
						return Object.keys( field.options );
					}
					
					if ( field.group_type == 'multiple' ) {
						if ( typeof field.subfields[optionName] == 'undefined' ) {
							continue;
						}
						
						if ( field.subfields[optionName].type == 'checkbox' ) {
							return [ 'on', 'off' ];
						}
						
						if ( field.subfields[optionName].type == 'select' || field.subfields[optionName].type == 'preset' ) {
							return Object.keys( field.subfields[optionName].options );
						}
					}
				}
			}
			
			return optionsList;
		},
		
		isLeftPanelActive: function() {
			return ( this.iframe.find('#eckb-article-left-sidebar div').length && this.iframe.find('#eckb-article-left-sidebar').width() ) || ( this.getOption( 'article-left-sidebar-toggle' ) == 'on' );
		},
		
		isRightPanelActive: function() {
			return (  this.iframe.find('#eckb-article-right-sidebar div').length && this.iframe.find('#eckb-article-right-sidebar').width() ) || ( this.getOption( 'article-right-sidebar-toggle' ) == 'on' );
		},
		
		getPostfix: function ( postfix ) {
			
			if ( typeof postfix == 'undefined' || postfix == '' ) {
				return '';
			}
			
			// check if we have a field with postfix like a name 
			let postfixField = this.getOption( postfix );
			
			if ( false === postfixField ) {
				return postfix;
			}
			
			return postfixField;
		},
		
		// detect errors during load iframe 
		errorHandler: function ( errorMsg, url, lineNumber, columnNumber, errorObject ) {

			if ( this.loadingIframe == false ) {
				return; // stop function if we don't log errors now 
			}
			
			let message = '';
			let error = '';
			
			if ( ~ errorMsg.indexOf( 'cross-origin' ) ) {
				// detect CRP
				message = epkb_editor.csr_error;
				error = 'Cross-Origin error';

			// only show the message
			} else if ( errorMsg == 'timeout1' ) {
				this.showMessage({
					html: $( '#epkb-editor-error-message-timeout-1' ).html(),
					type: 'error',
				});
				return;

			} else if ( errorMsg == 'timeout2' ) {
				message = epkb_editor.timeout2_error;
				error = 'Timeout error';

			} else {
				// other errors 
				message = epkb_editor.other_error_found;
				error = errorMsg + ' At ' + url + ' line: ' + lineNumber + ':' + columnNumber;
			}
			
			if ( $( '#epkb-editor-error-message-timeout-2' ).length ) {
				this.showMessage({
					html: $( '#epkb-editor-error-message-timeout-2' ).html(),
					type: 'error',
					timeout: 600000
				});
				
				$( '#epkb-editor-error-message-timeout-2' ).remove();
				
				window.epkbErrorsList = []; // clear global notices because we already show the message
			}
			
			$('.epkb-editor-error--form-message-1').text( message );
			$('textarea.editor_error').text( error );
			
			let app = this;
			
			app.clearErrorTimeouts();
			
			setTimeout( function() {
				app.removeLoader();
				$('body').removeClass('epkb-editor--active');
				$('body').removeClass( 'epkb-edit-mode' );
			}, 100 );
		},

		clearErrorTimeouts: function() {
			if ( typeof this.loadingIframe !== 'undefined' && this.loadingIframe ) {
				clearTimeout( this.loadingIframe );
			}
			
			if ( typeof this.longLoadingIframe !== 'undefined' && this.longLoadingIframe ) {
				clearTimeout( this.longLoadingIframe );
			}
			
			setTimeout( function() {
				this.loadingIframe = false; // stop logging errors 
			}, 100 );
		},
		
		sendErrorMessage: function ( event ) {
			event.preventDefault();
				
			let $form = $(this);
			let app = event.data;
			
			$.ajax({
				type: 'POST',
				dataType: 'json',
				url: epkb_editor.ajaxurl,
				data: $form.serialize(),
				beforeSend: function (xhr) {
					// block the form and add loader 
					$('#epkb-editor-error--form input, #epkb-editor-error--form textarea').prop( 'disabled', 'disabled' );
					$('.epkb-editor-error--form-response').html( epkb_editor.sending_error_report );
				}
			}).done(function (response) {
				// success message 
				if ( typeof response.success !== 'undefined' && response.success == false ) {
					$('.epkb-editor-error--form-response').html( response.data );
				} else if ( typeof response.success !== 'undefined' && response.success == true ) {
					$('.epkb-editor-error--form-response').html( response.data );
				} else {
					// something went wrong 
					$('.epkb-editor-error--form-response').html( epkb_editor.send_report_error );
				}
			}).fail(function (response, textStatus, error) {
				// something went wrong 
				$('.epkb-editor-error--form-response').html( epkb_editor.send_report_error );
			}).always(function () {
				// remove form loader 
				$('#epkb-editor-error--form input, #epkb-editor-error--form textarea').prop( 'disabled', false );
				setTimeout( function() {
					app.toggleMode( event );
				}, 4000 );
			});
		},
		
		/** Zones Navigation */
		
		showNavigation: function( disabledTab = false ) {
			
			let app = this;
			
			$( 'body' ).trigger( 'click.epkbcolorpicker' );

			// clear modal 
			app.clearModal();
			
			// update header
			$('.epkb-editor-header__inner__title').html( epkb_editor.navigation );
			
			// add tabs buttons on the top
			$('.epkb-editor-settings__panel-navigation-container').append( EPKBEditorTemplates.navigatorTabsHeaderSettings() );
			
			// make active global tab 
			$('#epkb-editor-settings-panel-content').removeClass('epkb-editor-settings__panel--active');
			
			if ( disabledTab ) {
				$('#epkb-editor-settings-panel-hidden').addClass('epkb-editor-settings__panel--active');
				$('#epkb-editor-settings-tab-hidden').addClass('epkb-editor-settings__panel-navigation__tab--active');
				$('#epkb-editor-settings-tab-navigator-enabled').removeClass('epkb-editor-settings__panel-navigation__tab--active');
				
			} else {
				$('#epkb-editor-settings-panel-navigator-enabled').addClass('epkb-editor-settings__panel--active');
				
			}
			
			
			// add global tab settings 
			$('#epkb-editor-settings-panel-navigator-enabled').append( EPKBEditorTemplates.navigation( app.getNavigation() ) );
			
			// fill disabled zone 
			let disabledZonesCounter = 0;
			
			for ( let zoneName in app.currentSettings ) {
				if ( typeof app.currentSettings[zoneName].disabled_settings == 'undefined' ) {
					continue;
				}
				
				let zone = app.currentSettings[zoneName], 
				    is_on = false;
					
				for ( let fieldName in zone.disabled_settings ) {
					let optionValue = app.getOption( fieldName );
					let conditionValue = zone.disabled_settings[fieldName];
					
					if ( optionValue != conditionValue ) {
						is_on = true;
					}						
				}
				
				// dont show activated zones
				if ( is_on ) {
					continue;
				}
				
				app.addCheckbox( zoneName, {
					label: ( zoneName == 'article_content' ) ? epkb_editor.article_header_rows : zone.title,
					value: 'off',
					editor_tab: 'hidden'
				});
				
				disabledZonesCounter++;
			}
			
			if ( ! disabledZonesCounter ) {
				app.addHeader( '', {
					content: epkb_editor.all_zones_active,
					editor_tab: 'hidden'
				});
			} else {
				
				if ( disabledZonesCounter > 1 ) {
					$('#epkb-editor-settings-tab-hidden .epkb-editor-settings__panel-navigation__tab__icon').append(`
						<span class="epkb-editor-settings__panel-navigation__tab__counter">${disabledZonesCounter}</span>
					`);
				}
			}
			
			app.showBackButtons();
			
			// change active zone 
			app.activeZone = 'navigation';
			
			$('#epkb-editor-show-navigation').addClass('epkb-editor-show-navigation--active');
			$('.epkb-editor-container').addClass('epkb-editor-container--navigator');
		},
		
		getNavigation: function() {
			
			let app = this;
			
			let zonesTree = [];
			
			this.iframe.find('.epkb-editor-zone').each(function(){
				
				let $parentEl = $(this);
				let level = 0;
				
				// select only top level
				if ( $parentEl.parents('.epkb-editor-zone').length ) {
					return true;
				}
				
				zonesTree.push({
					name: $parentEl.data('zone'),
					children: app.searchZones( $(this), level, app )
				});
				
			});
			
			// build html 
			return app.zonesList( zonesTree, app );
		},
		
		searchZones: function( $el, level, app ) {
			
			let children = [];
			
			if ( typeof $el == 'undefined' ) {
				return children;
			}
			
			if ( level > 100 ) {
				return children;
			}
			
			let $childEl = $el.find( '.epkb-editor-zone' );
			
			if ( ! $childEl.length ) {
				return children;
			}
			
			level++;
			
			
			$childEl.each(function(){
				
				if ( $(this).parents( '.epkb-editor-zone' ).length == 0 ) {
					return true;
				}
				
				// only first children level but any level in DOM 
				if ( $(this).parents( '.epkb-editor-zone' ).get(0) !== $el.get(0) ) {
					return true;
				}
				
				// check that zone is not duplicated 
				let duplicated = false;
				let zone = $(this).data('zone');
				
				children.forEach(function( element, index ){
					if ( element.name == zone ) {
						duplicated = index;
					}
				});
				
				if ( duplicated === false ) {
					children.push({ 
						name: zone,
						children: app.searchZones( $(this), level, app )
					});
				} else {
					
					let childrenZones = app.searchZones( $(this), level, app );
					
					if ( childrenZones.length ) {
						children[duplicated].children.push(childrenZones);
					}

				}
				
			});
			
			return children;
		},
		
		zonesList: function( data, app ) {
			let html = '<ul>';
			
			// add first top elements 
			data.forEach( function( element ){
					
				if ( typeof app.currentSettings[element.name] == 'undefined' || ( ! app.iframe.find( app.currentSettings[element.name].classes ).is(':visible') && ( element.name == 'search_button_zone' || element.name == 'article_search_button_zone' ) ) ) {
					return true;
				}
					
				html += `<li><a href="#" data-target="${app.currentSettings[element.name].classes}" class="epkb-editor-navigation__link" data-zone="${element.name}"><span class="epkb-editor-navigation__link__title">${app.currentSettings[element.name].title}</span> <span class="epkb-editor-navigation__link__help">(${epkb_editor.edit_zone})</span></a>`;
				
				// add children if exists
				if ( typeof element.children != 'undefined' && element.children.length > 0 ) {
					html += app.zonesList( element.children, app );
				}
				
				html += '</li>'
			});
			
			html += '</ul>';
			
			return html;
		}
	};

	window.EPKBEditorTemplates = {
		
		divider: function () {
			return `<div class="epkb-editor-settings-separator"></div>`;
		},

		select: function ( data ) {
			
			data = Object.assign( {
				name: '',
				label: '',
				value: '',
				style: '',
				separator_above: '',
				info_url: '',
				description: '',
			}, data );

			let html = '';
			if ( typeof data.separator_above !== 'undefined' ) {
				if( data.separator_above === 'yes' ){
					html += ` <div class="epkb-editor-settings-control-separator" data-separator="${data.name}"></div>`;
				}
			}
			
			if ( typeof data.style == 'undefined' ) {
				data.style = 'full'
			}
			
			if ( data.style == 'prev-next' ) {
				
				let selectedLabel = '';
				
				html += `
					<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-select epkb-editor-settings-control-type-select--${data.style}" data-field="${data.name}">
						<div class="epkb-editor-settings-control__field">
							<label class="epkb-editor-settings-control__title">${data.label} ${ data.info_url ? '<a class="epkb-editor-settings-control__info" href="' + data.info_url + '" target="_blank"><span class="epkbfa epkbfa-info-circle"></span><span class="info-tooltip">Click to read more about this feature</span></a>' : '' }</label>
							<select name="${data.name}" value="${data.value}" style="display:none;">`;
				
				
				for ( let optionName in data.options ) {
					
					// usual option 
					if ( typeof data.options[optionName] == 'string' ) {
	
						html += `
							<option value="${optionName}" ${ ( data.value == optionName ) ? 'selected="selected"' : '' }>${data.options[optionName]}</option>
						`;
						
						if ( data.value == optionName ) {
							selectedLabel = data.options[optionName];
						}
						
					// option group 
					} else {
						for ( let optionNameChild in data.options[optionName] ) {
							
							html += `
								<option value="${optionNameChild}" ${ ( data.value == optionNameChild ) ? 'selected="selected"' : '' }>${data.options[optionName][optionNameChild]}</option>
							`;
							
							if ( data.value == optionName ) {
								selectedLabel = data.options[optionName];
							}
						
						}
					}
					
				}
				
				html += `
					</select>
					<div class="epkb-editor-settings-control-type-select--buttons epkb-editor-settings-control__input">
						<div class="epkb-editor-settings-control-type-select--prev-button"><span class="epkbfa epkbfa-chevron-left"></span></div>
						<div class="epkb-editor-settings-control-type-select--label">${ selectedLabel }</div>
						<div class="epkb-editor-settings-control-type-select--next-button"><span class="epkbfa epkbfa-chevron-right"></span></div>
					</div>
				</div>
			</div>
				`;
				
				return html;
			}
				
					
			
			html += `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-select epkb-editor-settings-control-type-select--${data.style}" data-field="${data.name}">
					<div class="epkb-editor-settings-control__field">
						<label class="epkb-editor-settings-control__title">${data.label} ${ data.info_url ? '<a class="epkb-editor-settings-control__info" href="' + data.info_url + '" target="_blank"><span class="epkbfa epkbfa-info-circle"></span><span class="info-tooltip">Click to read more about this feature</span></a>' : '' }</label>
						<div class="epkb-editor-settings-control__input">
							<select name="${data.name}" value="${data.value}">
			`;

			for ( let optionName in data.options ) {
				
				// usual option 
				if ( typeof data.options[optionName] == 'string' ) {
					html += `
								<option value="${optionName}" ${ ( data.value == optionName ) ? 'selected="selected"' : '' }>${data.options[optionName]}</option>
					`;
				// option group 
				} else {
					html += `<optgroup label="${optionName}">`;
					
					for ( let optionNameChild in data.options[optionName] ) {
						html += `
									<option value="${optionNameChild}" ${ ( data.value == optionNameChild ) ? 'selected="selected"' : '' }>${data.options[optionName][optionNameChild]}</option>
						`;
					}
					
					html += `</optgroup>`
				}
				
				
			}

			html += `
							</select>
						</div>
					</div>
					${ data.description ? '<div class="epkb-editor-settings-control__description">' + data.description + '</div>' : '' }
				</div>
			`;

			return html;
		},
		
		units: function ( data ) {
			
			data = Object.assign( {
				name: '',
				value: '',
				options: []
			}, data );

			let html = '';
			
			html += `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-units" data-field="${data.name}">
					<div class="epkb-editor-settings-control__field">
						<div class="epkb-editor-settings-control__input">
			`;

			for ( let optionName in data.options ) {
				html += `
							<label>
								<input type="radio" name="${data.name}" value="${optionName}" ${ ( data.value == optionName ) ? 'checked="checked"' : '' }>
								<span>${data.options[optionName]}</span>
							</label>
				`;
			}

			html += `
						</div>
					</div>
				</div>
			`;

			return html;
		},
		
		checkbox: function ( data ) {
			data = Object.assign( {
				name: '',
				label: '',
				value: '',
				separator_above: '',
				info_url: '',
				description: ''
			}, data );


			let html = '';
			if ( typeof data.separator_above !== 'undefined' ) {
				if( data.separator_above === 'yes' ){
					html += ` <div class="epkb-editor-settings-control-separator" data-separator="${data.name}"></div>`;
				}
			}

			html += `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-toggle" data-field="${data.name}">
					<div class="epkb-editor-settings-control__field">
						<label class="epkb-editor-settings-control__title">${data.label} ${ data.info_url ? '<a class="epkb-editor-settings-control__info" href="' + data.info_url + '" target="_blank"><span class="epkbfa epkbfa-info-circle"></span><span class="info-tooltip">Click to read more about this feature</span></a>' : '' }</label>
						<div class="epkb-editor-settings-control__input">
							<label class="epkb-editor-settings-control-toggle">
								<input type="checkbox" class="epkb-editor-settings-control__input__toggle" value="yes" name="${data.name}" ${ ( data.value == 'on' ) ? 'checked="checked"' : '' }>
								<span class="epkb-editor-settings-control__input__label" data-on="${epkb_editor.checkbox_on}" data-off="${epkb_editor.checkbox_off}"></span>
								<span class="epkb-editor-settings-control__input__handle"></span>
							</label>
						</div>
					</div>
					${ data.description ? '<div class="epkb-editor-settings-control__description">' + data.description + '</div>' : '' }
				</div>
			`;
			return html;

		},
		
		text: function ( data ) {
			data = Object.assign( {
				name: '',
				label: '',
				value: '',
				style: '',
				info_url: '',
				description: '',
				separator_above: '',
				html: false
			}, data );

			let output = '';
			if ( typeof data.style == 'undefined' ) {
				data.style = 'full'
			}

			if ( typeof data.separator_above !== 'undefined' ) {
				if( data.separator_above === 'yes' ){
					output += ` <div class="epkb-editor-settings-control-separator" data-separator="${data.name}"></div>`;
				}
			}
			
			if ( data.html ) {
				return output += `
					<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-text epkb-control-text--${data.style}" data-field="${data.name}">
						<div class="epkb-editor-settings-control__field">
							<label class="epkb-editor-settings-control__title">${data.label} ${ data.info_url ? '<a class="epkb-editor-settings-control__info" href="' + data.info_url + '" target="_blank"><span class="epkbfa epkbfa-info-circle"></span><span class="info-tooltip">Click to read more about this feature</span></a>' : '' }</label>
							<div class="epkb-editor-settings-control__input">
								<textarea name="${data.name}">${data.value}</textarea>
							</div>
						</div>
						${ data.description ? '<div class="epkb-editor-settings-control__description">' + data.description + '</div>' : '' }
					</div>
				`;
				
			}

			return output += `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-text epkb-control-text--${data.style}" data-field="${data.name}">
					<div class="epkb-editor-settings-control__field">
						<label class="epkb-editor-settings-control__title">${data.label}</label>
						<div class="epkb-editor-settings-control__input">
							<input type="text" name="${data.name}" value="${data.value}" >
						</div>
					</div>
					${ data.description ? '<div class="epkb-editor-settings-control__description">' + data.description + '</div>' : '' }
				</div>
			`;

		},
		
		dimensions: function ( data ) {
			data = Object.assign( {
				label: '',
				units: '',
				name: '',
				info_url: '',
				description: '',
				subfields: {},
			}, data );
			
			if ( Object.keys(data.subfields).length < 1 ) {
				return this.notice( { 'title' : epkb_editor.wrong_dimensions } )
			}

			let dimCount = Object.keys(data.subfields).length;
			
			let html = `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-dimensions epkb-editor-settings-control-type-dimensions--count-${dimCount}" data-field="${data.name}">
					<div class="epkb-editor-settings-control__header">
						<div class="epkb-editor-settings-control__header__label">${data.label} ${ data.info_url ? '<a class="epkb-editor-settings-control__info" href="' + data.info_url + '" target="_blank"><span class="epkbfa epkbfa-info-circle"></span><span class="info-tooltip">Click to read more about this feature</span></a>' : '' }</div>
						<div class="epkb-editor-settings-control__header__units">${data.units}</div>
					</div>
					<div class="epkb-editor-settings-control__fields">
			`;
			
			// will be linked if all values are the same 
			let linked = true;
			let linkedValue;
			
			for ( let fieldName in data.subfields ) {
				if ( typeof linkedValue == 'undefined' ) {
					linkedValue = data.subfields[fieldName].value;
				}
				
				if ( linkedValue !== data.subfields[fieldName].value ) {
					linked = false;
				}
			}
			
			for ( let fieldName in data.subfields ) {
				html += `
					<div class="epkb-editor-settings-control__input ${ linked ? 'epkb-editor-settings-control__input__linking--active' : ''}">
						<input type="number" name="${fieldName}" value="${data.subfields[fieldName].value}" data-parentGroup="${data.name}">
						<span class="epkb-editor-settings-control__input__label">${data.subfields[fieldName].label}</span>
					</div>
				`;
			}
			
			html += ` 
						<div class="epkb-editor-settings-control__input">
							<button class="epkb-editor-settings-control__input__linking"><span class="epkbfa epkbfa-link" aria-hidden="true"></span></button>
						</div>
					</div>
					${ data.description ? '<div class="epkb-editor-settings-control__description">' + data.description + '</div>' : '' }
				</div>
			`;
			
			return html;
		},
		
		number: function ( data ) {
			data = Object.assign( {
				name: '',
				label: '',
				value: '',
				style: '',
				min: 0,
				max: 100,
				separator_above: '',
				info_url: '',
				description: ''
			}, data );

			let html = '';

			if ( typeof data.separator_above !== 'undefined' ) {
				if( data.separator_above === 'yes' ){
					html += ` <div class="epkb-editor-settings-control-separator" data-separator="${data.name}"></div>`;
				}
			}
			if ( typeof data.style == 'undefined' ) {
				data.style = 'default'
			}
			html += `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-number epkb-editor-settings-control-type-number--${data.style}" data-field="${data.name}">
					<div class="epkb-editor-settings-control__field">
						<label class="epkb-editor-settings-control__title">${data.label} ${ data.info_url ? '<a class="epkb-editor-settings-control__info" href="' + data.info_url + '" target="_blank"><span class="epkbfa epkbfa-info-circle"></span><span class="info-tooltip">Click to read more about this feature</span></a>' : '' }</label>
						<div class="epkb-editor-settings-control__input">
							<input type="number" name="${data.name}" value="${data.value}" min="${data.min}" max="${data.max}">
						</div>
					</div>
					<div class="epkb-editor-settings-control__slider"></div>
					${ data.description ? '<div class="epkb-editor-settings-control__description">' + data.description + '</div>' : '' }
				</div>
			`;
			return html;
		},
		
		header: function ( data ) {
			
			data = Object.assign( { content: '', name: '' }, data );
			
			return `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-header" data-field="${data.name}">
					${data.content}
				</div>
			`;
		},

		header_desc: function ( data ) {

			data = Object.assign( {
				title: '',
				desc: ''
			}, data );

			return `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-header-desc" data-field="${data.name}">
					<div class="epkb-editor-settings-control-type-header-desc__title">${data.title}</div>
					<div class="epkb-editor-settings-control-type-header-desc__desc">${data.desc}</div>
				</div>
			`;
		},

		colorPicker: function ( data ) {
			// check defaults 
			data = Object.assign( {
				name: '',
				label: '',
				value: '',
				separator_above: '',
				info_url: '',
				description: ''
			}, data );

			let html = '';

			if ( typeof data.separator_above !== 'undefined' ) {
				if( data.separator_above === 'yes' ){
					html += ` <div class="epkb-editor-settings-control-separator" data-separator="${data.name}"></div>`;
				}
			}

			html += `
			
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-color" data-field="${data.name}">
					<div class="epkb-editor-settings-control__field">
						<label class="epkb-editor-settings-control__title">${data.label} ${ data.info_url ? '<a class="epkb-editor-settings-control__info" href="' + data.info_url + '" target="_blank"><span class="epkbfa epkbfa-info-circle"></span><span class="info-tooltip">Click to read more about this feature</span></a>' : '' }</label>
						<div class="epkb-editor-settings-control__input">
							<input type="text" name="${data.name}" value="${data.value}" data-default_color="${data.value}">
						</div>
					</div>
					${ data.description ? '<div class="epkb-editor-settings-control__description">' + data.description + '</div>' : '' }
				</div>
			`;


			return html;
		},
		
		wpEditor: function ( data ) {
			data = Object.assign( {
				name: '',
				label: '',
				value: '',
				info_url: '',
				description: ''
			}, data );
			
			return `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-wp-editor" data-field="${data.name}">
					<div class="epkb-editor-settings-control__field">
						<label class="epkb-editor-settings-control__title">${data.label} ${ data.info_url ? '<a class="epkb-editor-settings-control__info" href="' + data.info_url + '" target="_blank"><span class="epkbfa epkbfa-info-circle"></span><span class="info-tooltip">Click to read more about this feature</span></a>' : '' }</label>
						<div class="epkb-editor-settings-control__input">
							<textarea style="display: none;" name="${data.name}">
								${data.value}
							</textarea>
							<button class="epkb-editor-settings-wpeditor_button">${epkb_editor.edit_button}</button>
						</div>
					</div>
					${ data.description ? '<div class="epkb-editor-settings-control__description">' + data.description + '</div>' : '' }
				</div>
			`;
		},
		
		rawHtml: function ( data ) {
			
			data = Object.assign( { content: '', name: '' }, data );
			
			return `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-raw-html" data-field="${data.name}">
					${data.content}
				</div>
			`;
		},
		
		modalHeader: function () {
			return `
				<!-- Header Container -->
					<header class="epkb-editor-header-container">
						<div class="epkb-editor-header__inner">
							<div class="epkb-editor-header__inner__menu-btn"><span class="epkbfa epkbfa-bars"></span></div>
							<div class="epkb-editor-header__inner__back-btn"><span class="epkbfa epkbfa-chevron-left"></span></div>
							<div class="epkb-editor-header__inner__title">${epkb_editor.epkb_name}</div>
							<div class="epkb-editor-header__inner__config"><span class="epkbfa epkbfa-cog"></span></div>
							<div class="epkb-editor-header__inner__close-btn"><span class="epkbfa epkbfa-times"></span></div>
						</div>
					</header>
				<!-- /Header Container -->`;
		},
		
		modalTabsHeader: function( data = [] ) {
		
			if ( data.length == 0 ) {
				return '';
			}
			
			let tabs = '';
			let firstTab = true;
			let tabClass;
			
			if ( ~data.indexOf( 'content' ) && firstTab ) {
				tabClass = 'epkb-editor-settings__panel-navigation__tab--active';
				firstTab = false;
			} else if ( ! ~data.indexOf( 'content' ) ) {
				tabClass = 'epkb-editor-settings__panel-navigation__tab--disabled';
			} else {
				tabClass = '';
			}
			
			tabs += `
				<div id="epkb-editor-settings-tab-content"  class="epkb-editor-settings__panel-navigation__tab  ${ tabClass }" data-target="content">
					<span class="epkb-editor-settings__panel-navigation__tab__icon"><span class="epkbfa epkbfa-pencil"></span></span>
					<span class="epkb-editor-settings__panel-navigation__tab__title">${epkb_editor.tab_content}</span>
				</div>`;
			
			if ( ~data.indexOf( 'style' ) && firstTab ) {
				tabClass = 'epkb-editor-settings__panel-navigation__tab--active';
				firstTab = false;
			} else if ( ! ~data.indexOf( 'style' ) ) {
				tabClass = 'epkb-editor-settings__panel-navigation__tab--disabled';
			} else {
				tabClass = '';
			}

			tabs += `
				<div id="epkb-editor-settings-tab-style"  class="epkb-editor-settings__panel-navigation__tab ${ tabClass }" data-target="style">
					<span class="epkb-editor-settings__panel-navigation__tab__icon"><span class="epkbfa epkbfa-adjust"></span></span>						
          <span class="epkb-editor-settings__panel-navigation__tab__title">${epkb_editor.tab_style}</span>
				</div>
			`;
			
			if ( ~data.indexOf( 'features' ) && firstTab ) {
				tabClass = 'epkb-editor-settings__panel-navigation__tab--active';
				firstTab = false;
			} else if ( ! ~data.indexOf( 'features' ) ) {
				tabClass = 'epkb-editor-settings__panel-navigation__tab--disabled';
			} else {
				tabClass = '';
			}
			
			tabs += `
				<div id="epkb-editor-settings-tab-features"  class="epkb-editor-settings__panel-navigation__tab ${ tabClass }" data-target="features">
					<span class="epkb-editor-settings__panel-navigation__tab__icon"><span class="epkbfa epkbfa-puzzle-piece"></span></span>
					<span class="epkb-editor-settings__panel-navigation__tab__title">${epkb_editor.tab_features}</span>
				</div>
			`;
				
			
			if ( ~data.indexOf( 'advanced' ) && firstTab ) {
				tabClass = 'epkb-editor-settings__panel-navigation__tab--active';
				firstTab = false;
			} else if ( ! ~data.indexOf( 'advanced' ) ) {
				tabClass = 'epkb-editor-settings__panel-navigation__tab--disabled';
			} else {
				tabClass = '';
			}
			
			tabs += `
				<div id="epkb-editor-settings-tab-advanced"  class="epkb-editor-settings__panel-navigation__tab ${ tabClass }" data-target="advanced">
					<span class="epkb-editor-settings__panel-navigation__tab__icon"><span class="epkbfa epkbfa-cogs"></span></span>
					<span class="epkb-editor-settings__panel-navigation__tab__title">${epkb_editor.tab_advanced}</span>
				</div>`;
			
			return tabs;
		},
		
		modalTabsHeaderSettings: function( ) {

			return `
				<div id="epkb-editor-settings-tab-global"  class="epkb-editor-settings__panel-navigation__tab epkb-editor-settings__panel-navigation__tab--active" data-target="global">
					<span class="epkb-editor-settings__panel-navigation__tab__icon"><span class="epkbfa epkbfa-globe"></span></span>
					<span class="epkb-editor-settings__panel-navigation__tab__title">${epkb_editor.tab_global}</span>
				</div>
			`;
		},
		
		navigatorTabsHeaderSettings: function( ) {

			return `
				<div id="epkb-editor-settings-tab-navigator-enabled"  class="epkb-editor-settings__panel-navigation__tab epkb-editor-settings__panel-navigation__tab--active" data-target="navigator-enabled">
					<span class="epkb-editor-settings__panel-navigation__tab__icon"><span class="epkbfa epkbfa-map-marker"></span></span>
					<span class="epkb-editor-settings__panel-navigation__tab__title">${epkb_editor.enabled_list}</span>
				</div>
				<div id="epkb-editor-settings-tab-hidden"  class="epkb-editor-settings__panel-navigation__tab" data-target="hidden">
					<span class="epkb-editor-settings__panel-navigation__tab__icon"><span class="epkbfa epkbfa-eye-slash"></span></span>						
					<span class="epkb-editor-settings__panel-navigation__tab__title">${epkb_editor.tab_hidden}</span>
				</div>
			`;
		},
		
		modalTabsBody: function( data = [] ) {
		
			return `
				<div id="epkb-editor-settings-panel-content" class="epkb-editor-settings__panel epkb-editor-settings__panel--active" data-panel="content"></div>
				<div id="epkb-editor-settings-panel-style" class="epkb-editor-settings__panel" data-panel="style"></div>
				<div id="epkb-editor-settings-panel-features" class="epkb-editor-settings__panel" data-panel="features"></div>
				<div id="epkb-editor-settings-panel-advanced" class="epkb-editor-settings__panel" data-panel="advanced"></div>
				<div id="epkb-editor-settings-panel-global" class="epkb-editor-settings__panel" data-panel="global">
					<div class="epkb-editor-settings-panel-global__links-container"></div>
					<div class="epkb-editor-settings-panel-global__settings-container"></div>
				
				</div>
				<div id="epkb-editor-settings-panel-navigator-enabled" class="epkb-editor-settings__panel" data-panel="navigator-enabled"></div>
				<div id="epkb-editor-settings-panel-hidden" class="epkb-editor-settings__panel" data-panel="hidden"></div>
				
				<div class="epkb-editor-settings__help">
					<a href="https://www.echoknowledgebase.com/front-end-editor-support-and-questions/" target="_blank">
						<span class="">${epkb_editor.need_help}</span>
						<span class="epkbfa epkbfa-question-circle-o"></span>
					</a>
				</div>
			`;
		},

		// data: { tabs: [] }
		modalSettingsContainer: function( data = {} ) {
			
			let container = '';
			
			container += `
				<!-- Settings Container -->
				<main class="epkb-editor-settings-container">
					<div class="epkb-editor-settings__inner">
			`;
			
			if ( typeof data.tabs !== 'undefined' ) {
				container += `
					<!-- Panel Navigation -->
					<div class="epkb-editor-settings__panel-navigation-container">
						${this.modalTabsHeader( data.tabs )}
					</div>
					<!-- /Panel Navigation -->
					<!-- Panels Content -->
					<div class="epkb-editor-settings__panel-content-container">
						${this.modalTabsBody()}
						
					</div>
					<!-- /Panels Content -->
					
					${epkb_editor.menu_links_html}
					
				`;
			}
			
			container += `
					</div>
				</main>
				<!-- /Settings Container -->
			`;

			return container;
		},
	
		modalFooter: function () {
			return `
				<footer class="epkb-editor-footer-container">
					<nav class="epkb-editor-footer-nav">
						<div class="epkb-editor-footer-nav__item epkb-editor-footer-nav__item-icon" style="display:none;"><span class="epkbfa epkbfa-reply-all" id="epkb-show-list"></span></div>
						
						<div class="epkb-editor-footer-nav__item epkb-editor-footer-nav__item-btn epkb-editor-footer-nav__item-btn__navigation">
							<button id="epkb-editor-show-navigation" class="epkb-editor-btn epkb-editor-navigation">
								<span class="epkbfa epkbfa-map-marker"></span>
								${epkb_editor.navigation}
							</button>
						</div>
						<div class="epkb-editor-footer-nav__item epkb-editor-footer-nav__item-btn">
							<button id="epkb-editor-exit" class="epkb-editor-btn epkb-editor-exit">${epkb_editor.exit_button}</button>
						</div>
						<div class="epkb-editor-footer-nav__item epkb-editor-footer-nav__item-btn">
							<button id="epkb-editor-save" class="epkb-editor-btn epkb-editor-save">${epkb_editor.save_button}</button>
						</div>
					</nav>
				</footer>
				
				<div id="epkb-editor-close">&times;</div>
			`;
		},
		
		modalWindow: function() {
			return `
				<div id="epkb-editor" class="epkb-editor-container">
					${ this.modalHeader() }
					${ this.modalSettingsContainer( { tabs : [] } ) }
					${ this.modalFooter() }
				</div>
			`;
		},
		
		// data = {  icon: '', title: '', message: '', style: '' }
		notice: function ( data = {} ) {

			// check defaults 
			data = Object.assign( {
				icon: 'exclamation-triangle', // https://fontawesome.com/icons/
				title: '',
				message: '',
				style: 'default'
			}, data );
			
			return `
				<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-notice epkb-editor-settings-control-type-notice--${data.style}">
					<div class="epkb-editor-notice__icon"><span class="epkbfa epkbfa-${data.icon}"></span></div>
					<div class="epkb-editor-notice__body">
						<div class="epkb-editor-notice__title">${data.title}</div>
						<div class="epkb-editor-notice__message">${data.message}</div>
					</div>
				</div>
			`;
		},

		
		// data = { title: '', text: ''}
		message: function( data = {} ) {
			
			if ( typeof data.title == 'undefined' ) {
				data.title = '';
			} else {
				data.title = '<h4>' + data.title + '</h4>';
			}
			
			if ( typeof data.text == 'undefined' ) {
				data.text = '';
			}
			
			if ( typeof data.type == 'undefined' ) {
				data.type = 'success';
			}
			
			return `
				<div class="eckb-bottom-notice-message">
					<div class="contents">
						<span class="${data.type}">
							${data.title}
							<p>${data.text}</p>
						</span>
					</div>
					<div class='epkb-close-notice epkbfa epkbfa-window-close'></div>
				</div>
			`;
		},
	
		menuLinks: function( url, dataName, icon, title  ) {

			return `
				<a href="${url}" data-name="${dataName}" class="epkb-editor-settings-menu__group-item-container" target="_blank">
					<div class="epkb-editor-settings-menu__group-item__icon epkbfa epkbfa-${icon}"></div>
					<div class="epkb-editor-settings-menu__group-item__title">${title}</div>
				</a>
			`;
		},	
		
		navigation: function ( navHTML ) {
			return `<div class="epkb-editor-navigation">${navHTML}</div>`;
		},
	};
	
	EPKBEditor.init();
	
});
