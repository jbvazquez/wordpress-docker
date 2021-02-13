<?php

/**
 * Configuration for the front end editor
 */
class EPKB_Editor_Main_Page_Config extends EPKB_Editor_Base_Config {

	/** SEE DOCUMENTATION IN THE BASE CLASS **/

	/**
	 * Content zone - The whole page (applies only to KB Template)
	 * @return array
	 */
	private static function page_zone() {
		
		$preset_options = [];
		$preset_options['current'] = __( 'Current', 'echo-knowledge-base' );
		
		foreach ( EPKB_KB_Wizard_Themes::get_all_presets() as $theme_slug => $theme_data ) {
			$preset_options[$theme_data['theme_category']][$theme_slug] = $theme_data['kb_name'];
		}
		
		$settings = [

			// Features Tab
			'templates_display_main_page_main_title' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => '1',
			],
			
			'theme_presets' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'default' => 'current',
				'label' => __( 'Theme Presets', 'echo-knowledge-base' ),
				'name' => 'theme',
				'options' => $preset_options,
				'type' => 'select'
			],

			'theme_presets_INFO'                               => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'type' => 'raw_html',
				'content' => '<div class="epkb-editor__info"><span class="epkbfa epkbfa-info-circle"></span> ' .
				             __('Additional Grid Layout, Sidebar Layout, and Modular Layout are all available in our Elegant Layouts add-on.', 'echo-knowledge-base') .
				             ' <a href="https://www.echoknowledgebase.com/wordpress-plugin/elegant-layouts/" target="_blank"><span class="epkbfa epkbfa-external-link"></span></a></div>'
			],

			// Advanced Tab
			'templates_for_kb_padding_group' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'group_type' => self::EDITOR_GROUP_DIMENSIONS,
				'label' => __( 'Padding', 'echo-knowledge-base' ),
				'units' => 'px',
				'subfields' => [
					'templates_for_kb_padding_left' => [
						'style_name' => 'padding-left',
						'postfix' => 'px',
						'target_selector' => '.eckb-kb-template',
					],
					'templates_for_kb_padding_top' => [
						'style_name' => 'padding-top',
						'postfix' => 'px',
						'target_selector' => '.eckb-kb-template',
					],
					'templates_for_kb_padding_right' => [
						'style_name' => 'padding-right',
						'postfix' => 'px',
						'target_selector' => '.eckb-kb-template',
					],
					'templates_for_kb_padding_bottom' => [
						'style_name' => 'padding-bottom',
						'postfix' => 'px',
						'target_selector' => '.eckb-kb-template',
					],
				]
			],
			'templates_for_kb_margin_group' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'group_type' => self::EDITOR_GROUP_DIMENSIONS,
				'label' => __( 'Margin', 'echo-knowledge-base' ),
				'units' => 'px',
				'subfields' => [
					'templates_for_kb_margin_left' => [
						'style_name' => 'margin-left',
						'postfix' => 'px',
						'target_selector' => '.eckb-kb-template',
					],
					'templates_for_kb_margin_top' => [
						'style_name' => 'margin-top',
						'postfix' => 'px',
						'target_selector' => '.eckb-kb-template',
					],
					'templates_for_kb_margin_right' => [
						'style_name' => 'margin-right',
						'postfix' => 'px',
						'target_selector' => '.eckb-kb-template',
					],
					'templates_for_kb_margin_bottom' => [
						'style_name' => 'margin-bottom',
						'postfix' => 'px',
						'target_selector' => '.eckb-kb-template',
					],
				]
			],
		];

		return [
			'content_zone' => [
				'title'     =>  __( 'Page Content', 'echo-knowledge-base' ),
				'classes'   => '.eckb-kb-template',
				'settings'  => $settings,
				'parent_zone_tab_title' => __( 'Page Content', 'echo-knowledge-base' )
			]];
	}

	/**
	 * Serach Box zone
	 * @return array
	 */
	private static function search_box_zone() {
		
		$settings = [
			'width' => [    // search box width
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => '1',
			],
			'width_info'                               => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'type' => 'raw_html',
				'toggler' => [
					'templates_for_kb' => 'current_theme_templates',
				],
				'content' => '<div class="epkb-editor__info"><span class="epkbfa epkbfa-info-circle"></span> ' . 
				__('We have detected that you are using the Current Theme Template option. If your width is not expanding the way you want, it is because the theme is controlling the total width. ' . 
					'You have two options: either switch to the KB Template option or check your theme settings to expand the width.', 'echo-knowledge-base') .
				 ' <a href="https://www.echoknowledgebase.com/documentation/current-theme-template-vs-kb-template/" target="_blank"><span class="epkbfa epkbfa-external-link"></span></a></div>'
			],
			'search_layout' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'reload' => '1',
			],
			'search_background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-doc-search-container',
				'style_name' => 'background-color'
			],
			
			// Checked setting: grouped control with units 
			'search_box_padding' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'group_type' => self::EDITOR_GROUP_DIMENSIONS,
				'label' => __( 'Padding', 'echo-knowledge-base' ),
				'units' => 'px',
				'subfields' => [
					'search_box_padding_left' => [
						'target_selector' => '.epkb-doc-search-container',
						'style_name' => 'padding-left',
						'postfix' => 'px'
					],
					'search_box_padding_top' => [
						'target_selector' => '.epkb-doc-search-container',
						'style_name' => 'padding-top',
						'postfix' => 'px'
					],
					'search_box_padding_right' => [
						'target_selector' => '.epkb-doc-search-container',
						'style_name' => 'padding-right',
						'postfix' => 'px'
					],
					'search_box_padding_bottom' => [
						'target_selector' => '.epkb-doc-search-container',
						'style_name' => 'padding-bottom',
						'postfix' => 'px'
					],
				]
			],
			'search_box_margin' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'group_type' => self::EDITOR_GROUP_DIMENSIONS,
				'label' => __( 'Margin', 'echo-knowledge-base' ),
				'units' => 'px',
				'subfields' => [
					'search_box_margin_top' => [
						'target_selector' => '.epkb-doc-search-container',
						'style_name' => 'margin-top',
						'postfix' => 'px'
					],
					'search_box_margin_bottom' => [
						'target_selector' => '.epkb-doc-search-container',
						'style_name' => 'margin-bottom',
						'postfix' => 'px'
					],
				]
			],
		];

		return [
			'search_box_zone' => [
				'title'     =>  __( 'Search Box', 'echo-knowledge-base' ),
				'classes'   => '.epkb-doc-search-container',
				'settings'  => $settings,
				'disabled_settings' => [
					'search_layout' => 'epkb-search-form-0'
				],
				'parent_zone_tab_title' => __( 'Search Box', 'echo-knowledge-base' ),
			]];
	}

	/**
	 * Search Title zone
	 * @return array
	 */
	private static function search_title_zone() {

		$settings = [

			'search_title' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'target_selector' => '.epkb-doc-search-container__title',
				'target_attr' => 'value',
				'text' => 1
			],
			'search_title_html_tag' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'target_selector' => '.epkb-doc-search-container__title',
				'reload' => 1,
				'text_style' => 'inline'
			],
			'search_title_font_size' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-doc-search-container__title',
				'style_name' => 'font-size',
				'style' => 'slider',
				'postfix' => 'px'
			],
			'search_title_font_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-doc-search-container__title',
				'style_name' => 'color'
			],
		];

		return [
			'search_title_zone' => [
				'title'     =>  __( 'Search Title', 'echo-knowledge-base' ),
				'classes'   => '.epkb-doc-search-container__title',
				'settings'  => $settings
			]];
	}

	/**
	 * Search Input box zone
	 * @return array
	 */
	private static function search_input_zone() {

		$settings = [
			// Content Tab
			'search_box_hint' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'target_selector' => '#epkb_search_terms',
				'target_attr' => 'placeholder|aria-label',
			],
			'search_results_msg' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
			],
			'no_results_found' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
			],
			'min_search_word_size_msg' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
			],

			// Style Tab
			'search_box_input_width' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '#epkb_search_form',
				'style_name' => 'width',
				'postfix' => '%'
			],
			'search_input_border_width' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-search-box input[type=text]',
				'style_name' => 'border-width',
				'postfix' => 'px'
			],
			'search_text_input_border_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-search-box input[type=text]',
				'style_name' => 'border-color'
			],
			'search_text_input_background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-search-box input[type=text]',
				'style_name' => 'background-color',
			],

			// Features Tab
			'search_box_results_style' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'target_selector' => '#epkb_search_results',
			],

			// Advanced Tab

		];

		return [
			'search_input_zone' => [
				'title'     =>  __( 'Search Input Box', 'echo-knowledge-base' ),
				'classes'   => '.epkb-doc-search-container input',
				'settings'  => $settings
			]];
	}

	/**
	 * Serach Button zone
	 * @return array
	 */
	private static function search_button_zone() {

		$settings = [
			'search_button_name' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'target_selector' => '#epkb-search-kb',
				'target_attr' => 'value',
				'text' => 1
			],
			'search_btn_background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-search-box button',
				'style_name' => 'background-color'
			],
			'search_btn_border_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-search-box button',
				'style_name' => 'border-color'
			],
		];

		return [
			'search_button_zone' => [
				'title'     =>  __( 'Search Button', 'echo-knowledge-base' ),
				'classes'   => '.epkb-search-box button',
				'disabled_settings' => [
					'search_layout' => 'epkb-search-form-3'
				],
				'settings'  => $settings
		]];
	}

	/**
	 * Category Zone - all articles and categories
	 * @return array
	 */
	private static function categories_container_zone() {

		$settings = [

			// Content Tab

			// Style Tab
			'background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '#epkb-content-container',
				'style_name' => 'background-color'
			],
			'categories_container_category_box_header' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'type' => 'header',
				'content' => 'Category Box'
			],
			'section_border_radius' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'postfix' => 'px',
				'styles' => [
					'.epkb-top-category-box' => 'border-radius',
					'.section-head' => 'border-top-right-radius',
					'.section-head ' => 'border-top-left-radius', // space is important to have different keys in array
				]
			],
			'section_border_width' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-top-category-box',
				'style_name' => 'border-width',
				'postfix' => 'px'
			],
			'section_border_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-top-category-box',
				'style_name' => 'border-color'
			],
			'section_font_size' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'reload' => '1'
			],

			// Features Tab
			'section_box_shadow' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => 1,
			],
			'nof_columns' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => '1'
			],

			// Advanced Tab

		];
		return [
			'categories_zone' => [
				'title'     =>  __( 'Categories', 'echo-knowledge-base' ),
				'classes'   => '.eckb-categories-list',
				'settings'  => $settings
			]];
	}

	/**
	 * Category Header
	 * @return array
	 */
	private static function category_header_zone( $kb_id ) {

		$settings = [

			// Content Tab


			// Style Tab
			'section_head_background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-top-category-box .section-head',
				'style_name' => 'background-color'
			],
			'section_head_category_icon_color'      => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.section-head .epkb-cat-icon',
				'style_name' => 'color',
				'separator_above'   => 'yes',
			],
			'section_head_font_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.section-head .epkb-cat-name, .section-head .epkb-cat-name a, div>.epkb-category-level-1',
				'style_name' => 'color'
			],

			// Features Tab
			'section_head_category_icon_location' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => '1'
			],
			'section_head_category_icon_size' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'target_selector' => '.section-head .epkb-cat-icon',
				'description' => '<a href="' . admin_url('edit-tags.php?taxonomy=' . EPKB_KB_Handler::get_category_taxonomy_name( $kb_id ) .'&post_type=' . EPKB_KB_Handler::get_post_type( $kb_id )) . '" target="_blank">' . __( 'Edit Categories Icons', 'echo-knowledge-base' ) . '</a>',
				'style_name' => 'font-size',
				'postfix' => 'px',
				'styles' => [
					'.section-head img.epkb-cat-icon' => 'max-height'
				]
			],
			'section_desc_text_on' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => '1',
				'separator_above'   => 'yes',
				'description' => '<a href="' . admin_url('edit-tags.php?taxonomy=' . EPKB_KB_Handler::get_category_taxonomy_name( $kb_id ) .'&post_type=' . EPKB_KB_Handler::get_post_type( $kb_id )) . '" target="_blank">' . __( 'Edit Categories Descriptions', 'echo-knowledge-base' ) . '</a>'
				
			],
			'section_head_description_font_color'   => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'target_selector' => '.epkb-category-level-1+p',
				'style_name'        => 'color',
				'toggler'           => 'section_desc_text_on'
			],
			'section_head_alignment' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'target_selector' => '.epkb-category--top-cat-icon',
				'style_name' => 'justify-content',
				'styles' => [
					'.epkb-category--top-cat-icon' => 'text-align',
					'.section-head p' => 'text-align',
				],
				'postfix' => ' ',
				'separator_above'   => 'yes',
			],
			'section_hyperlink_text_on' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'separator_above'   => 'yes',
				'reload' => '1',
			],

			// Advanced Tab
			'section_head_padding' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'group_type' => self::EDITOR_GROUP_DIMENSIONS,
				'label' => __( 'Padding', 'echo-knowledge-base' ),
				'subfields' => [
					'section_head_padding_left' => [
						'target_selector' => '.epkb-top-category-box .section-head',
						'style_name' => 'padding-left',
						'postfix' => 'px'
					],
					'section_head_padding_top' => [
						'target_selector' => '.epkb-top-category-box .section-head',
						'style_name' => 'padding-top',
						'postfix' => 'px'
					],
					'section_head_padding_right' => [
						'target_selector' => '.epkb-top-category-box .section-head',
						'style_name' => 'padding-right',
						'postfix' => 'px'
					],
					'section_head_padding_bottom' => [
						'target_selector' => '.epkb-top-category-box .section-head',
						'style_name' => 'padding-bottom',
						'postfix' => 'px'
					],
				]
			],

		];
		return [
			'category_header_zone' => [
				'title'     =>  __( 'Category Header', 'echo-knowledge-base' ),
				'classes'   => '.section-head',
				'settings'  => $settings
			]];
	}

	/**
	 * Category Body
	 * @return array
	 */
	private static function category_body_zone() {

		$settings = [

			// Content Tab
			'category_empty_msg' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'target_selector' => '.epkb-articles-coming-soon',
				'text' => '1'
			],

			// Style Tab
			'section_body_background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-top-category-box',
				'style_name' => 'background-color'
			],
			'category_body_sub_category_header' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'type' => 'header',
				'content' => 'Sub Category'
			],
			'expand_articles_icon' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'reload' => '1'
			],
			'section_category_icon_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-category-level-2-3>i',
				'style_name' => 'color'
			],
			'section_category_font_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-category-level-2-3__cat-name, .epkb-category-level-2-3__cat-name a',
				'style_name' => 'color',
			],

			// Features Tab
			'section_body_height' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'target_selector' => '.epkb-section-body',
				'reload' => '1',
				'separator_above' => 'yes',
			],
			'section_box_height_mode' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'target_selector' => '.epkb-section-body',
				'reload' => '1'
			],
			'section_divider'       => [
				'editor_tab'        => self::EDITOR_TAB_FEATURES,
				'target_selector'   => '.epkb-top-category-box .section-head',
				'reload'            => 1,
				'separator_above'   => 'yes'
			],
			'section_divider_thickness' => [
				'editor_tab'        => self::EDITOR_TAB_FEATURES,
				'target_selector'   => '.epkb-top-category-box .section-head',
				'style_name'        => 'border-bottom-width',
				'postfix'           => 'px',
				'toggler'           => 'section_divider'
			],
			'section_divider_color' => [
				'editor_tab'        => self::EDITOR_TAB_FEATURES,
				'target_selector'   => '.epkb-top-category-box .section-head',
				'style_name'        => 'border-bottom-color',
				'toggler'           => 'section_divider'
			],

			// Advanced Tab
			'section_body_padding' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'group_type' => self::EDITOR_GROUP_DIMENSIONS,
				'label' => __( 'Padding', 'echo-knowledge-base' ),

				'subfields' => [
					'section_body_padding_left' => [
						'target_selector' => '.epkb-section-body',
						'style_name' => 'padding-left',
						'postfix' => 'px'
					],
					'section_body_padding_top' => [
						'target_selector' => '.epkb-section-body',
						'style_name' => 'padding-top',
						'postfix' => 'px'
					],
					'section_body_padding_right' => [
						'target_selector' => '.epkb-section-body',
						'style_name' => 'padding-right',
						'postfix' => 'px'
					],
					'section_body_padding_bottom' => [
						'target_selector' => '.epkb-section-body',
						'style_name' => 'padding-bottom',
						'postfix' => 'px'
					],
				]
			],

		];

		return [
			'category_box_zone' => [
				'title'     =>  __( 'Category Body', 'echo-knowledge-base' ),
				'parent_zone_tab_title' => __( 'Category Body', 'echo-knowledge-base' ),
				'classes'   => '.epkb-section-body',
				'settings'  => $settings
			]];
	}

	/**
	 * Articles zone
	 * @return array
	 */
	private static function articles_zone() {

		$settings = [

			// content
			'collapse_articles_msg' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
			],
			'show_all_articles_msg' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
			],

			// style
			'article_font_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.eckb-article-title',
				'style_name' => 'color'
			],
			'article_icon_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.eckb-article-title>i',
				'style_name' => 'color'
			],

			// features
			'nof_articles_displayed' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => '1'
			],

			// advanced
			'article_list_margin' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'target_selector' => '.epkb-articles',
				'style_name' => 'padding-left',
				'postfix' => 'px'
			],
			'article_list_spacing' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'styles' => [
					'.epkb-articles .epkb-article-level-1' => 'padding-top',
					'.epkb-articles .epkb-article-level-1' => 'padding-bottom'
				],
				'postfix' => 'px'
			],
			'section_article_underline' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => 1,
			],
		];

		return [
			'articles_zone' => [
				'title'     =>  __( 'Articles', 'echo-knowledge-base' ),
				'classes'   => '.epkb-articles',
				'settings'  => $settings
			]];
	}

	/**
	 * Tabs zone - for Tabs Layout
	 * @return array
	 */
	private static function tabs_zone() {

		$settings = [

			// Content Tab

			// Style Tab
			'tab_font_size'                     => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-nav-tabs .epkb-category-level-1',
				'reload' => '1',
			],
			'tab_nav_font_color'                => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-nav-tabs .epkb-category-level-1, .epkb-nav-tabs .epkb-category-level-1+p',
				'style_name' => 'color',
			],
			'tab_nav_active_font_color'         => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' =>
					'
					#epkb-content-container .epkb-nav-tabs .active .epkb-category-level-1,
					#epkb-content-container .epkb-nav-tabs .active .epkb-category-level-1+p
					',
				'style_name' => 'color',
				'separator_above' => 'yes'
			],
			'tab_nav_active_background_color'   => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '#epkb-content-container .epkb-nav-tabs .active',
				'style_name' => 'background-color',
				'styles' => [
					'#epkb-content-container .epkb-nav-tabs .active:after' => 'border-top-color'
				]
			],
			'tab_nav_border_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-nav-tabs',
				'style_name' => 'border-color',
				'separator_above' => 'yes'
			],
			'tab_nav_background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.epkb-main-nav, .epkb-nav-tabs',
				'style_name' => 'background-color'
			],

			// Features Tab
			'tab_down_pointer' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => 1,
			],

			// Advanced Tab

		];

		return [
			'tabs_zone' => [
				'title'     =>  __( 'Tabs', 'echo-knowledge-base' ),
				'classes'   => '.epkb-main-nav',
				'settings'  => $settings
			]];
	}

	/**
	 * Retrieve Editor configuration
	 * @param $kb_config
	 * @return array
	 */
	public function get_config( $kb_config ) {
		
		$editor_config = [];

		// Advanced Search has its own search box settings so exclude the KB core ones
		if ( ! $this->is_asea ) {
			$editor_config += self::search_box_zone();
			$editor_config += self::search_title_zone();
			$editor_config += self::search_input_zone();
			$editor_config += self::search_button_zone();
		}

		// Categories and Articles for KB Core Layouts
		if ( $this->is_basic_main_page || $this->is_tabs_main_page || $this->is_categories_main_page ) {
			$editor_config += self::categories_container_zone();
			$editor_config += self::category_header_zone( $kb_config['id'] );
			$editor_config += self::category_body_zone();
			$editor_config += self::articles_zone();
			$editor_config += self::tabs_zone();
		}

		$unset_settings = [];

		if ( $kb_config['templates_for_kb'] != 'kb_templates' ) {
			$unset_settings = array_merge($unset_settings,[
				'templates_display_main_page_main_title',
			]);
		}
		if ( EPKB_Utilities::is_elegant_layouts_enabled() ) {
			$unset_settings = array_merge($unset_settings, [
				'theme_presets_INFO',
			]);
		}

		// Sidebar uses article page zone otherwise use Main Page page zone
		if ( $this->is_sidebar_main_page ) {
			$editor_config += EPKB_Editor_Article_Page_Config::page_zone( true );
			$unset_settings = array_merge($unset_settings,[
				'width',
				'templates_for_kb_article_padding_group',
				'templates_for_kb_article_margin_group',
			]);

		} else {
			$editor_config += self::page_zone();
		}

		return self::get_editor_config( $kb_config, $editor_config, $unset_settings, 'main-page' );
	}
}