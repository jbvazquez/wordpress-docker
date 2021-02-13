<?php

/**
 * Configuration for the front end editor
 */
 
class EPKB_Editor_Archive_Page_Config extends EPKB_Editor_Base_Config {

	/** SEE DOCUMENTATION IN THE BASE CLASS **/

	/**
	 * Archive zone
	 * @return array
	 */
	private static function archive_zone() {
		// TODO check config, only templates_for_kb_category_archive_page_heading_description tested
		$settings = [

			// Content Tab
			'category_focused_menu_heading_text' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'target_selector' => '.eckb-acll__title',
				'text' => 1
			],
			'templates_for_kb_category_archive_page_heading_description' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'target_selector' => '.eckb-category-archive-title-desc',
				'text' => 1
			],
			'templates_for_kb_category_archive_read_more' => [
				'editor_tab' => self::EDITOR_TAB_CONTENT,
				'target_selector' => '.eckb-article-read-more-text',
				'text' => 1
			],

			// Style Tab
			'templates_for_kb_category_archive_page_style' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'reload' => '1'
			],

			// Features Tab
			'archive-content-width-v2' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'reload' => '1',
				'style'       => 'small',
			],

			// Advanced Tab
			'archive-container-width-units-v2' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'type' => 'units',
				'target_selector' => '#eckb-categories-archive-container-v2'
			],
			'archive-container-width-v2' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'postfix' => 'archive-container-width-units-v2',
				'style'       => 'small',
				'styles' => [
					'#eckb-categories-archive-container-v2' => 'width',
				]
			],
			'archive-content-padding-v2' => [
				'editor_tab' => self::EDITOR_TAB_ADVANCED,
				'target_selector' => '#eckb-categories-archive__body__content',
				'style_name' => 'padding',
				'postfix' => 'px',
				'style'       => 'small',

			],

		];

		return [
			'archive' => [
				'title'     =>  __( 'Archive', 'echo-knowledge-base' ),
				'classes'   => '#eckb-categories-archive__body',
				'settings'  => $settings
			]];
	}
	
	/**
	 * Categories List zone
	 * @return array
	 */
	private static function categories_layout_list_zone() {

		$settings = [

			// Content Tab
			'category_box_title_text_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => ' .eckb-acll__title',
				'style_name' => 'color'
			],
			'category_box_container_background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.eckb-article-cat-layout-list',
				'style_name' => 'background-color'
			],
			'category_box_category_text_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.eckb-acll__cat-item__name',
				'style_name' => 'color'
			],
			'category_box_count_background_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.eckb-acll__cat-item__count',
				'style_name' => 'background-color'
			],
			'category_box_count_text_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.eckb-acll__cat-item__count',
				'style_name' => 'color'
			],
			'category_box_count_border_color' => [
				'editor_tab' => self::EDITOR_TAB_STYLE,
				'target_selector' => '.eckb-acll__cat-item__count',
				'style_name' => 'border-color'
			],

			// Features Tab
			'categories_box_font_size' => [
				'editor_tab' => self::EDITOR_TAB_FEATURES,
				'styles' => [
					'.eckb-article-cat-layout-list' => 'font-size',
					'.eckb-article-cat-layout-list a' => 'font-size',
				],
				'style' => 'slider',
				'postfix' => 'px'
			],
		];

		return [
			'categories_list' => [
				'title'     =>  __( 'Categories List', 'echo-knowledge-base' ),
				'classes'   => '.eckb-article-cat-layout-list',
				'settings'  => $settings
			]];
	}
	
	/**
	 * Retrieve Editor configuration
	 * @param $kb_config
	 * @return array
	 */
	public function get_config( $kb_config ) {

		// Result config
		$editor_config = [];
		$editor_config += self::archive_zone();
		$editor_config += self::categories_layout_list_zone();

		return self::get_editor_config( $kb_config, $editor_config, [], 'archive-page' );
	}
}