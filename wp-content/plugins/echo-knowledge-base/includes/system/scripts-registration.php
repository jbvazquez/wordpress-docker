<?php

/**  Register JS and CSS files  */

/**
 * FRONT-END pages using our plugin features
 */
function epkb_load_public_resources() {
    global $eckb_kb_id;
	
	epkb_register_public_resources();
	
    // if this is not KB Main Page or Article Page or Category Archive page then do not load public resources
    if ( empty($eckb_kb_id) ) {
        return;
    }

	epkb_enqueue_public_resources();

	// add Frontend Editor button to the admin panel
	if ( function_exists('wp_get_current_user') && current_user_can('manage_options') ) {
		add_action( 'admin_bar_menu', 'epkb_add_admin_bar_button', 1000 );
	}
}
add_action( 'wp_enqueue_scripts', 'epkb_load_public_resources', 500 );

/**
 * Register for FRONT-END pages using our plugin features
 */
function epkb_register_public_resources() {

	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

	wp_register_style( 'epkb-public-styles', Echo_Knowledge_Base::$plugin_url . 'css/public-styles' . $suffix . '.css', array(), Echo_Knowledge_Base::$version );
	wp_register_style( 'epkb-icon-fonts', Echo_Knowledge_Base::$plugin_url . 'css/epkb-icon-fonts' . $suffix . '.css', array(), Echo_Knowledge_Base::$version );

	wp_register_script( 'epkb-public-scripts', Echo_Knowledge_Base::$plugin_url . 'js/public-scripts' . $suffix . '.js', array('jquery'), Echo_Knowledge_Base::$version );
	wp_register_script( 'epkb-materialize', Echo_Knowledge_Base::$plugin_url . 'js/lib/materialize' . $suffix . '.js', array('jquery'), Echo_Knowledge_Base::$version );

	wp_localize_script( 'epkb-public-scripts', 'epkb_vars', array(
		'msg_try_again'         => esc_html__( 'Please try again later.', 'echo-knowledge-base' ),
		'error_occurred'        => esc_html__( 'Error occurred', 'echo-knowledge-base' ) . ' (16)',
		'not_saved'             => esc_html__( 'Error occurred - configuration NOT saved (6).', 'echo-knowledge-base' ),
		'unknown_error'         => esc_html__( 'Unknown error', 'echo-knowledge-base' ) . ' (17)',
		'reload_try_again'      => esc_html__( 'Please reload the page and try again.', 'echo-knowledge-base' ),
		'save_config'           => esc_html__( 'Saving configuration', 'echo-knowledge-base' ),
		'input_required'        => esc_html__( 'Input is required', 'echo-knowledge-base' ),
		'reduce_name_size'      => esc_html__( 'Warning: Please reduce your name size. Tab will only show first 25 characters', 'echo-knowledge-base' ),
		'load_template'         => esc_html__('Loading Template...', 'echo-knowledge-base' ),
	));
}

/**
 * Queue for FRONT-END pages using our plugin features
 */
function epkb_enqueue_public_resources() {
	wp_enqueue_style( 'epkb-public-styles' );
	wp_enqueue_script( 'epkb-public-scripts' );
	wp_enqueue_script( 'epkb-materialize' );  // scrollSpy for TOC
}
add_action( 'epkb_enqueue_scripts', 'epkb_enqueue_public_resources' ); // use this action in any place to add scripts $kb_id as a parameter

/**
 * Queue for FRONT-END pages using our plugin features
 */
function epkb_enqueue_font() {
	wp_enqueue_style( 'epkb-icon-fonts' );
}
add_action( 'epkb_enqueue_font_scripts', 'epkb_enqueue_font' ); // use this action in any place to add scripts $kb_id as a parameter

/**
 * BACK-END: KB Config page needs front-page CSS resources
 */
function epkb_kb_config_load_public_css() {

	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

	wp_enqueue_style( 'epkb-public-styles', Echo_Knowledge_Base::$plugin_url . 'css/public-styles' . $suffix . '.css', array(), Echo_Knowledge_Base::$version );

	$kb_id = EPKB_KB_Handler::get_current_kb_id();
	if ( empty($kb_id) ) {
		return;
	}

	$kb_config = epkb_get_instance()->kb_config_obj->get_kb_config( $kb_id );
	if ( is_wp_error( $kb_config ) ) {
		return;
	}

	echo epkb_frontend_kb_theme_styles_now( $kb_config );
}

/**
 * ADMIN-PLUGIN MENU PAGES (Plugin settings, reports, lists etc.)
 */
function epkb_load_admin_plugin_pages_resources() {
	
	global $pagenow;
	
	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

	wp_enqueue_style( 'epkb-admin-plugin-pages-styles', Echo_Knowledge_Base::$plugin_url . 'css/admin-plugin-pages' . $suffix . '.css', array(), Echo_Knowledge_Base::$version );
	wp_enqueue_style( 'wp-color-picker' ); //Color picker

	wp_enqueue_script( 'epkb-admin-plugin-pages-scripts', Echo_Knowledge_Base::$plugin_url . 'js/admin-plugin-pages' . $suffix . '.js',
					array('jquery', 'jquery-ui-core','jquery-ui-dialog','jquery-effects-core','jquery-effects-bounce', 'jquery-ui-sortable'), Echo_Knowledge_Base::$version );
	wp_localize_script( 'epkb-admin-plugin-pages-scripts', 'epkb_vars', array(
					'msg_try_again'         => esc_html__( 'Please try again later.', 'echo-knowledge-base' ),
					'error_occurred'        => esc_html__( 'Error occurred', 'echo-knowledge-base' ) . ' (11)',
					'not_saved'             => esc_html__( 'Error occurred - configuration NOT saved (12).', 'echo-knowledge-base' ),
					'unknown_error'         => esc_html__( 'Unknown error', 'echo-knowledge-base' ) . ' (13)',
					'reload_try_again'      => esc_html__( 'Please reload the page and try again.', 'echo-knowledge-base' ),
					'save_config'           => esc_html__( 'Saving configuration', 'echo-knowledge-base' ),
					'input_required'        => esc_html__( 'Input is required', 'echo-knowledge-base' ),
					'sending_feedback'      => esc_html__('Sending feedback ...', 'echo-knowledge-base' ),
					'changing_debug'        => esc_html__('Changing debug ...', 'echo-knowledge-base' ),
					'help_text_coming'      => esc_html__('Help text is coming soon.', 'echo-knowledge-base' ),
					'load_template'         => esc_html__('Loading Template...', 'echo-knowledge-base' )
				));
	
	// used by WordPress color picker  ( wpColorPicker() )
	wp_localize_script( 'wp-color-picker', 'wpColorPickerL10n',
			array(
				'clear'            =>   __( 'Reset', 'echo-knowledge-base' ),
				'clearAriaLabel'   =>   __( 'Reset color', 'echo-knowledge-base' ),
				'defaultString'    =>   __( 'Default', 'echo-knowledge-base' ),
				'defaultAriaLabel' =>   __( 'Select default color', 'echo-knowledge-base' ),
				'pick'             =>   '',
				'defaultLabel'     =>   __( 'Color value', 'echo-knowledge-base' ),
			));
	wp_enqueue_script( 'wp-color-picker' );
	wp_enqueue_style( 'wp-jquery-ui-dialog' );

	// add for Category icon upload
	if ( $pagenow == 'term.php' || $pagenow == 'edit-tags.php' ) {
		wp_enqueue_media();
	}
}

// Old Wizards
function epkb_load_admin_kb_config_script() {
	
	global $pagenow;
	
	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

	wp_enqueue_script( 'epkb-admin-kb-config-menu-script', Echo_Knowledge_Base::$plugin_url . 'js/admin-kb-config-menu-script' . $suffix . '.js',
		array('jquery',	'jquery-ui-core', 'jquery-ui-dialog', 'jquery-effects-core', 'jquery-effects-bounce', 'wp-color-picker'), Echo_Knowledge_Base::$version );
	wp_localize_script( 'epkb-admin-kb-config-menu-script', 'epkb_vars', array(
		'msg_try_again'         => esc_html__( 'Please try again later.', 'echo-knowledge-base' ),
		'error_occurred'        => esc_html__( 'Error occurred', 'echo-knowledge-base' ) . ' (13)',
		'not_saved'             => esc_html__( 'Error occurred - configuration NOT saved (5).', 'echo-knowledge-base' ),
		'unknown_error'         => esc_html__( 'Unknown error', 'echo-knowledge-base' ) . ' (15)',
		'reload_try_again'      => esc_html__( 'Please reload the page and try again.', 'echo-knowledge-base' ),
		'save_config'           => esc_html__( 'Saving configuration', 'echo-knowledge-base' ),
		'input_required'        => esc_html__( 'Input is required', 'echo-knowledge-base' ),
		'reduce_name_size'      => esc_html__( 'Warning: Please reduce your name size. Tab will only show first 25 characters', 'echo-knowledge-base' ),
		'archive_page'          => esc_html__( 'Archive Page configuration is available only for KB Template. Switch on KB Template to continue.', 'echo-knowledge-base' ),
		'updating_preview'      => esc_html__( 'Updating page preview ...', 'echo-knowledge-base' ),
		'changing_config'       => esc_html__('Changing to selected configuration...', 'echo-knowledge-base' ),
		'switching_article_seq' => esc_html__('Switching article sequence ...', 'echo-knowledge-base' ),
		'preview'               => esc_html__('Preview', 'echo-knowledge-base' ),
		'load_template'         => esc_html__('Loading Template...', 'echo-knowledge-base' )
	));

	wp_enqueue_script( 'epkb-admin-kb-wizard-script', Echo_Knowledge_Base::$plugin_url . 'js/admin-kb-wizard-script' . $suffix . '.js',
		array('jquery',	'jquery-ui-core', 'jquery-ui-dialog', 'jquery-effects-core', 'jquery-effects-bounce'), Echo_Knowledge_Base::$version );
	wp_enqueue_script( 'epkb-materialize', Echo_Knowledge_Base::$plugin_url . 'js/lib/materialize' . $suffix . '.js', array('jquery'), Echo_Knowledge_Base::$version );
	wp_localize_script( 'epkb-admin-kb-wizard-script', 'epkb_vars', array(
		'msg_try_again'         => esc_html__( 'Please try again later.', 'echo-knowledge-base' ),
		'error_occurred'        => esc_html__( 'Error occurred', 'echo-knowledge-base' ) . ' (14)',
		'not_saved'             => esc_html__( 'Error occurred - configuration NOT saved (5).', 'echo-knowledge-base' ),
		'unknown_error'         => esc_html__( 'Unknown error', 'echo-knowledge-base' ) . ' (15)',
		'reload_try_again'      => esc_html__( 'Please reload the page and try again.', 'echo-knowledge-base' ),
		'input_required'        => esc_html__( 'Input is required', 'echo-knowledge-base' ),
		'load_template'         => esc_html__('Loading Preview...', 'echo-knowledge-base' ),
		'wizard_help_images_path' => Echo_Knowledge_Base::$plugin_url . 'img/',
		'asea_wizard_help_images_path' => class_exists( 'Echo_Advanced_Search' ) && ! empty(Echo_Advanced_Search::$plugin_url) ? Echo_Advanced_Search::$plugin_url . 'img/' : '',
		'elay_wizard_help_images_path' => class_exists( 'Echo_Elegant_Layouts' ) && ! empty(Echo_Elegant_Layouts::$plugin_url) ? Echo_Elegant_Layouts::$plugin_url . 'img/' : '',
		'eprf_wizard_help_images_path' => class_exists( 'Echo_Article_Rating_And_Feedback' ) && ! empty(Echo_Article_Rating_And_Feedback::$plugin_url) ? Echo_Article_Rating_And_Feedback::$plugin_url . 'img/' : ''
	));

	if ( $pagenow == 'edit.php' && isset($_GET['wizard-text']) && class_exists('Echo_Elegant_Layouts') ) {
		wp_enqueue_editor();
	}
	
	add_filter('admin_body_class', 'epkb_admin_wizard_body_class' );
}

// Setup Wizard
function epkb_load_admin_kb_setup_wizard_script() {
	
	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

	wp_enqueue_style( 'epkb-admin-plugin-pages-styles', Echo_Knowledge_Base::$plugin_url . 'css/admin-plugin-pages' . $suffix . '.css', array(), Echo_Knowledge_Base::$version );
	wp_enqueue_script( 'epkb-admin-kb-setup-wizard-script', Echo_Knowledge_Base::$plugin_url . 'js/admin-kb-setup-wizard-script' . $suffix . '.js',
		array('jquery',	'jquery-ui-core', 'jquery-ui-dialog', 'jquery-effects-core', 'jquery-effects-bounce'), Echo_Knowledge_Base::$version );
	wp_localize_script( 'epkb-admin-kb-setup-wizard-script', 'epkb_vars', array(
		'msg_try_again'         => esc_html__( 'Please try again later.', 'echo-knowledge-base' ),
		'error_occurred'        => esc_html__( 'Error occurred', 'echo-knowledge-base' ) . ' (14)',
		'not_saved'             => esc_html__( 'Error occurred - configuration NOT saved (5).', 'echo-knowledge-base' ),
		'unknown_error'         => esc_html__( 'Unknown error', 'echo-knowledge-base' ) . ' (15)',
		'reload_try_again'      => esc_html__( 'Please reload the page and try again.', 'echo-knowledge-base' ),
		'input_required'        => esc_html__( 'Input is required', 'echo-knowledge-base' ),
		'load_template'         => esc_html__('Loading Preview...', 'echo-knowledge-base' ),
		'wizard_help_images_path' => Echo_Knowledge_Base::$plugin_url . 'img/',
	));
}

// Article Edit Page
function epkb_load_admin_article_edit_script() {

	if ( EPKB_Utilities::get('post') == '' || EPKB_Utilities::get('action') != 'edit' ) {
		return;
	}

	$post_type = get_post_type( EPKB_Utilities::get('post') );
	
	//Added only for KB Core
	if ( ! empty($post_type) && EPKB_KB_Handler::is_kb_post_type( $post_type ) && ! EPKB_Utilities::is_amag_on() ) {

		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
		$depends = array(
				'wp-plugins',
				'wp-element',
				'wp-components'
			);
		
		if ( ! EPKB_Utilities::is_classic_editor_plugin_active() ) {
			$depends[] = 'wp-edit-post';
		}
		
		wp_enqueue_script('epkb-admin-kb-article-edit-script', Echo_Knowledge_Base::$plugin_url . 'js/admin-kb-article-edit-script' . $suffix . '.js', $depends	);
	}
}
//add_action('admin_enqueue_scripts','epkb_load_admin_article_edit_script');

// remove wordpress strings on certain pages
function epkb_admin_wizard_body_class( $classes ) {
	// Note: Add a leading space and a trailing space.
	$classes .= ' epkb-configuration-page ';
	return $classes;
}

/**
 * Add style for current KB template
 */
function epkb_frontend_kb_theme_styles() {
	global $eckb_kb_id;

	$kb_id = empty($eckb_kb_id) ? EPKB_KB_Handler::get_kb_id_from_kb_main_shortcode() : $eckb_kb_id;
	if ( empty( $kb_id ) ) {
		return;
	}

	$kb_config = epkb_get_instance()->kb_config_obj->get_kb_config_or_default( $kb_id );

	echo epkb_frontend_kb_theme_styles_now( $kb_config );
}
add_action( 'wp_head', 'epkb_frontend_kb_theme_styles' );

/**
 * Certain styles need to be inserted in the header.
 *
 * @param $kb_config
 * @return string
 */
function epkb_frontend_kb_theme_styles_now( $kb_config ) {

	global $eckb_is_kb_main_page;

	$is_kb_main_page = ! empty($eckb_is_kb_main_page);

	// get any style from add-ons
	$add_on_output = apply_filters( 'eckb_frontend_kb_theme_style', '', $kb_config['id'], $is_kb_main_page );
	if ( empty($add_on_output) || ! is_string($add_on_output) )  {
		$add_on_output = '';
	}

	$output = '<style type="text/css" id="epkb-advanced-style">
		/* KB Core 
		-----------------------------------------------------------------------*/
		#epkb-content-container .epkb-nav-tabs .active:after {
			border-top-color: ' . $kb_config['tab_nav_active_background_color'] . '!important
		}
		#epkb-content-container .epkb-nav-tabs .active {
			background-color: ' . $kb_config['tab_nav_active_background_color'] . '!important
		}
		#epkb-content-container .epkb-nav-tabs .active .epkb-category-level-1,
		#epkb-content-container .epkb-nav-tabs .active p {
			color: ' . $kb_config['tab_nav_active_font_color'] . '!important
		}
		#epkb-content-container .epkb-nav-tabs .active:before {
			border-top-color: ' . $kb_config['tab_nav_border_color'] . '!important
		}		
	';

	$output .= $add_on_output;

	$output .= '</style>';

	return $output;
}

/**
 * Load TOC classes to counter theme issues
 * @param $classes
 * @return array
 */
function epkb_front_end_body_classes( $classes ) {
	global $eckb_kb_id;

	// load only on article pages
	if ( empty($eckb_kb_id) )  {
		return $classes;
	}

	$kb_config = epkb_get_instance()->kb_config_obj->get_kb_config_or_default( $eckb_kb_id );

	// load only if TOC is active
	if ( 'on' != $kb_config['article_toc_enable'] ) {
		return $classes;
	}

	// get current post
	$post = isset($GLOBALS['post']) ? $GLOBALS['post'] : '';
	if ( empty($post) || ! $post instanceof WP_Post ) {
		return $classes;
	}

	// is this KB Main Page ?
	$eckb_is_kb_main_page = false;
	$all_kb_configs = epkb_get_instance()->kb_config_obj->get_kb_configs( true );
	foreach ( $all_kb_configs as $one_kb_config ) {
		if ( ! empty($one_kb_config['kb_main_pages']) && is_array($one_kb_config['kb_main_pages']) &&
		     in_array($post->ID, array_keys($one_kb_config['kb_main_pages']) ) ) {
			$eckb_is_kb_main_page = true;
			break;  // found matching KB Main Page
		}
	}

	if ( $eckb_is_kb_main_page ) {
		return $classes;
	}

	$classes[] = 'eckb-front-end-body';

	return $classes;

}
add_filter( 'body_class','epkb_front_end_body_classes' );

// load style for Admin Article Page
function epkb_load_admin_article_page_styles() {
	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
	wp_enqueue_style( 'epkb-admin-plugin-pages-styles', Echo_Knowledge_Base::$plugin_url . 'css/admin-article-page' . $suffix . '.css', array(), Echo_Knowledge_Base::$version );
}

/**
 * Register KB areas for widgets to be added to
 */
function epkb_register_kb_sidebar() {

	$kb_ids = epkb_get_instance()->kb_config_obj->get_kb_ids();
	foreach( $kb_ids as $kb_id ) {

		$widget_seq_num = count($kb_ids) > 1 ? ' #' . $kb_id : '';
		$widget_id = $kb_id == 1 ? 'eckb_articles_sidebar' : 'eckb_articles_sidebar_' . $kb_id;

		// add KB sidebar area
		register_sidebar(array(
			'name' => __('Echo KB' . $widget_seq_num . ' Articles Sidebar' , 'echo-knowledge-base'),
			'id' => $widget_id,
			'before_widget' => '<div id="eckb-%1$s" class="eckb-article-widget-sidebar-body__widget">',
			'after_widget' => '</div> <!-- end Widget -->',
			'before_title' => '<h4>',
			'after_title' => '</h4>'
		));
	}
}
add_action( 'widgets_init', 'epkb_register_kb_sidebar' );

/**
 * Add KB filters for other plugins to use
 */
add_filter( 'kb_core/kb_config/get_kb_configs', function() {
	return epkb_get_instance()->kb_config_obj->get_kb_configs();
} );

/**
 * Add KB filters for other plugins to use
 */
add_filter( 'kb_core/kb_config/get_kb_config', function( $kb_id ) {
	return epkb_get_instance()->kb_config_obj->get_kb_config_or_default( $kb_id );
} );

/**
 * Add KB filters for other plugins to use
 */
add_filter( 'kb_core/kb_icons/get_category_icon', function( $term_id, $categories_icons ) {
	return EPKB_KB_Config_Category::get_category_icon( $term_id, $categories_icons );
}, 10, 2 );


/**************  Frontend Editor  *****************/

/**
 * Load scripts for Frontend Editor
 */
function epkb_load_front_end_editor() {
	
	global $eckb_kb_id, $wp_scripts, $post, $wp_styles;
	
	if ( empty($eckb_kb_id)  || empty($post->post_type) || // not a page
		defined( 'DOING_AJAX' ) && DOING_AJAX || // return if we get page by ajax 
		! empty( $_REQUEST['elementor-preview'] ) || // elementor preview
		! empty( $_REQUEST['et_fb'] ) // if we are on DIVI page 
	) {
		return;
	}

	$kb_config = epkb_get_instance()->kb_config_obj->get_kb_config_or_default( $eckb_kb_id );

	if ( EPKB_Config_Menu::check_editor_compatibility( $kb_config ) != '' ) {
		return;
	}

	// is this KB page?
	$page_type = epkb_front_end_editor_type();
	if ( $page_type != 'main-page' && $page_type != 'article-page' && $page_type != 'archive-page' ) {
		return;
	}

	// add config from addons 
	$kb_config = apply_filters( 'eckb_kb_config', $kb_config );
	if ( empty($kb_config)  || is_wp_error($kb_config) ) {
		return;
	}

	// get Editor settings
	if ( $page_type == 'main-page' ) {
		$editor_config = new EPKB_Editor_Main_Page_Config( $kb_config );
	} else if ( $page_type == 'article-page' ) {
		$editor_config = new EPKB_Editor_Article_Page_Config( $kb_config );
	} else if ( $page_type == 'archive-page' ) {
		$editor_config = new EPKB_Editor_Archive_Page_Config( $kb_config );
	} else {
		return;
	}

	EPKB_Error_Handler::add_assets();
		
	$config_settings = $editor_config->get_config( $kb_config );
	$editor_settings = $editor_config->get_editor_panel_config( $kb_config );
	
	// Only styles and zones for preview iframe of the actual page
	if ( ! empty( $_REQUEST['epkb-editor'] ) ) {
		wp_enqueue_style( 'epkb-editor', Echo_Knowledge_Base::$plugin_url . 'css/editor.css', array(), Echo_Knowledge_Base::$version );

		echo	"<script data-cfasync='false'>
					var epkb_editor_config = " . wp_json_encode( $config_settings, ENT_QUOTES ) . ";
				</script>";

		return;
	}
	
	// remove all registered styles and scripts 
	foreach ( $wp_scripts->registered as $key => $val ) {
		wp_dequeue_script($key);
	}
	foreach ( $wp_styles->registered as $key => $val ) {
		wp_dequeue_style($key);
	}

	// load KB resources
	epkb_register_public_resources();
	epkb_enqueue_public_resources();

	wp_enqueue_editor();
	
	wp_register_script( 'iris', admin_url('js/iris.min.js'), array( 'jquery', 'jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch' ), '1.0.7', true );
	
	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
	
	// styles
	wp_register_script( 'epkb-color-picker', Echo_Knowledge_Base::$plugin_url . 'js/lib/color-picker' . $suffix . '.js', array('iris'), null, true );
	
	// enqueue
	wp_enqueue_style( 'epkb-editor', Echo_Knowledge_Base::$plugin_url . 'css/editor.css', array(), Echo_Knowledge_Base::$version );

	wp_enqueue_script( 'epkb-editor', Echo_Knowledge_Base::$plugin_url . 'js/editor' . $suffix . '.js', array('jquery'), Echo_Knowledge_Base::$version );

	wp_localize_script( 'epkb-editor', 'epkb_editor_config', $config_settings );
	wp_localize_script( 'epkb-editor', 'epkb_editor_settings', $editor_settings );

	$epkb_editor = array(
		'_wpnonce_apply_editor_changes' => wp_create_nonce( '_wpnonce_apply_editor_changes' ),
		'ajaxurl' 						=> admin_url( 'admin-ajax.php', 'relative' ),
		'kb_url' 						=> admin_url( 'edit.php?post_type=' . EPKB_KB_Handler::KB_POST_TYPE_PREFIX . $eckb_kb_id ),
		'epkb_editor_kb_id' 			=> $eckb_kb_id,
		'page_type' 					=> $page_type,
		'turned_on'         			=> __( 'Hide KB Settings', 'echo-knowledge-base' ),
		'loading'           			=> __( 'Loading...', 'echo-knowledge-base' ),
		'turned_off'        			=> epkb_front_end_editor_title(),
		'default_header'    			=> __( 'Settings panel', 'echo-knowledge-base' ),
		'epkb_name'         			=> __( 'Echo Knowledge Base', 'echo-knowledge-base' ),
		'tab_content'       			=> __( 'Content', 'echo-knowledge-base' ),
		'tab_style'         			=> __( 'Style', 'echo-knowledge-base' ),
		'tab_features'      			=> __( 'Features', 'echo-knowledge-base' ),
		'tab_advanced'      			=> __( 'Advanced', 'echo-knowledge-base' ),
		'tab_global'      				=> __( 'General Settings', 'echo-knowledge-base' ),
		'tab_hidden'      				=> __( 'Deactivated Sections', 'echo-knowledge-base' ),
		'save_button'       			=> __( 'Save', 'echo-knowledge-base' ),
		'exit_button'       			=> __( 'Exit Editor', 'echo-knowledge-base' ),
		'clear_modal_notice' 			=> __( 'Click on any page element to change its settings', 'echo-knowledge-base' ),
		'no_settings'     				=> __( 'This zone have no settings yet', 'echo-knowledge-base' ),
		'checkbox_on'    				=> __( 'Yes', 'echo-knowledge-base' ),
		'checkbox_off'    				=> __( 'No', 'echo-knowledge-base' ),
		'wrong_dimensions' 				=> __( 'Invalid dimensions', 'echo-knowledge-base' ),
		'left_panel' 					=> __( 'Left Panel', 'echo-knowledge-base' ),
		'right_panel' 					=> __( 'Right Panel', 'echo-knowledge-base' ),
		'edit_button' 					=> __( 'Edit', 'echo-knowledge-base' ),
		'preopen' 						=> empty ( $_REQUEST['preopen'] ) ? '' : $_REQUEST['preopen'],
		'settings_html' 				=> EPKB_Editor_View::get_editor_settings_html( $kb_config ),
		'menu_links_html'				=> EPKB_Editor_View::get_editor_modal_menu_links( $page_type, $kb_config ),
		'urls_and_slug' 				=> __( 'URLs and Slug', 'echo-knowledge-base' ),
		'order_categories_and_articles' => __( 'Order Categories and Articles', 'echo-knowledge-base' ),
		'rename_kb' 					=> __( 'Rename KB Name and Title', 'echo-knowledge-base' ),
		'theme_link' 					=> __( 'Template', 'echo-knowledge-base' ),
		'layouts_link' 					=> __( 'Layouts', 'echo-knowledge-base' ),
		'color_value' 					=> __( 'Color value', 'echo-knowledge-base' ),
		'select_color' 					=> __( 'Select Color', 'echo-knowledge-base' ),
		'default' 						=> __( 'Default', 'echo-knowledge-base' ),
		'select_default_color' 			=> __( 'Select default color', 'echo-knowledge-base' ),
		'clear' 						=> __( 'Clear', 'echo-knowledge-base' ),
		'clear_color' 					=> __( 'Clear color', 'echo-knowledge-base' ),
		'sidebar_settings'				=> __( 'The Sidebar setting can be changed on the article page.', 'echo-knowledge-base' ),
		'navigation' 					=> __( 'Navigation', 'echo-knowledge-base' ),
		'enabled_list' 					=> __( 'Enabled Sections', 'echo-knowledge-base' ),
		'enable_disable_sections_link' 	=> __( 'Disabled Sections', 'echo-knowledge-base' ),
		'all_zones_active' 				=> __( 'All Sections are enabled', 'echo-knowledge-base' ),
		'edit_zone' 					=> __( 'Edit Section', 'echo-knowledge-base' ),
		'need_help' 					=> __( 'Need Help', 'echo-knowledge-base' ),
		'sending_error_report' 			=> __( 'Sending, please wait', 'echo-knowledge-base' ),
		'send_report_error' 			=> __( 'Could not submit the error. ', 'echo-knowledge-base' ) . EPKB_Utilities::contact_us_for_support(),
		'timeout2_error' 				=> '', //__( 'We found an issue with this page.', 'echo-knowledge-base' ),
		'other_error_found' 			=> '', //__( 'We found an issue with your website configuration.', 'echo-knowledge-base' ),
		'csr_error' 					=> sprintf( '%s <a href="%s" target="_blank">%s</a>',
											__( 'We detected CSP error. See the reference article about CSP ', 'echo-knowledge-base' ),
											'https://www.echoknowledgebase.com/documentation/content-security-policy/',
											__( 'here.', 'echo-knowledge-base' )
		),
		'wrong_select' => 				__( 'No value to select', 'echo-knowledge-base' ),
		'article_header_rows' => 		__( 'Article Header Rows', 'echo-knowledge-base' ),
		
	);
	
	$epkb_editor = apply_filters( 'epkb_editor_localize', $epkb_editor );
	wp_localize_script( 'epkb-editor', 'epkb_editor', $epkb_editor );
	
	$epkb_editor_addon_data = apply_filters( 'epkb_editor_addon_data', array(), $kb_config );
	wp_localize_script( 'epkb-editor', 'epkb_editor_addon_data', $epkb_editor_addon_data );

	wp_enqueue_script( 'jquery-ui-slider' );
	wp_enqueue_script( 'epkb-color-picker' );
}

/**
 * Add Frontend Editor option in the WordPress admin bar.
 * Fired by `admin_bar_menu` filter.
 * @param WP_Admin_Bar $wp_admin_bar
 */
function epkb_add_admin_bar_button( WP_Admin_Bar $wp_admin_bar ) {

	$title = epkb_front_end_editor_title();
	$wp_admin_bar->add_menu( array( 'id' => 'epkb-edit-mode-button', 'title' => $title, 'href' => add_query_arg( [ 'action' => 'epkb_load_editor' ] ) ) );
}

function epkb_front_end_editor_title() {
	
	$title = '';
	
	switch ( epkb_front_end_editor_type() ) {
		case 'article-page':
			$title = __( 'Edit Article Page Configuration', 'echo-knowledge-base' );
			break;
		case 'main-page':
			$title = __( 'Edit Main Page Configuration', 'echo-knowledge-base' );
			break;
		case 'archive-page':
			$title = __( 'Edit Archive Page Configuration', 'echo-knowledge-base' );
			break;
	}
	
	return $title;
}

function epkb_front_end_editor_type() {
	global $post;

	if ( EPKB_KB_Handler::is_kb_post_type( $post->post_type ) && ! is_archive() ) {
		return 'article-page';
	}
	
	if ( $post->post_type == 'page' ) {
		return 'main-page';
	} 
	
	if ( EPKB_KB_Handler::is_kb_post_type( $post->post_type ) && is_archive() ) {
		return 'archive-page';
	} 
	
	return '';
}