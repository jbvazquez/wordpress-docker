<?php

/**
 * Output panels for the front-end editor for KB page configuration as a template
 */
class EPKB_Editor_View {
	
	function __construct() {

	   if ( ! function_exists('wp_get_current_user')) {
		   include(ABSPATH . "wp-includes/pluggable.php");
	   }

	   if ( ! current_user_can( 'manage_options' ) ) {
		   return;
	   }

		if ( empty( $_REQUEST['epkb-editor'] ) ) {
			add_action( 'template_include', array( $this, 'frontend_editor_page' ), 99 );
		}
		
		add_action( 'wp_enqueue_scripts', 'epkb_load_front_end_editor', 999999 );
		add_filter( 'show_admin_bar', '__return_false' );
	}
	 
	/**
	 * Various HTML pieces for the Editor
	 * - TinyMCE settings
	 * - error handling messages
	 */
	public static function get_editor_html() {        ?>

		<div class="epkb-editor-popup" style="display: none;">
			<div class="epkb-editor-popup__header"></div>
			<div class="epkb-editor-popup__body"><?php

				// TinyMCE: no _ and - in id, only letters in lowercase to prevent WP conflicts
				wp_editor( '', 'epkbeditormce', array(
					'wpautop' => false,
					'media_buttons' => true,
				) ); ?>

			</div>
			<div class="epkb-editor-popup__footer">
				<button id="epkb-editor-popup__button-update"><?php _e( 'Update', 'echo-knowledge-base' ); ?></button>
				<button id="epkb-editor-popup__button-cancel"><?php _e( 'Cancel', 'echo-knowledge-base' ); ?></button>
			</div>
		</div>

		<div class="epkb-frontend-loader" style="display: none;">
			<div class="epkb-frontend-loader-icon epkbfa epkbfa-hourglass-half"></div>
		</div>		
		
		<div class="epkb-editor-error-message" id="epkb-editor-error-message-timeout-1" style="display:none!important;">
			<div class="eckb-bottom-notice-message eckb-bottom-notice-message--center-loader-bottom">
				<div class="contents">
					<span class="error">
						<h4><?php _e( 'The KB front-end Editor is taking long to load. Please wait a bit longer.', 'echo-knowledge-base' ); ?></h4>
					</span>
				</div>
				<div class="epkb-close-notice epkbfa epkbfa-window-close"></div>
			</div>
		</div>
		
		<div class="epkb-editor-error-message" id="epkb-editor-error-message-timeout-2" style="display:none!important;">
			<div class="eckb-bottom-notice-message eckb-bottom-notice-message--center-aligned">
				<div class="contents">
					<span class="error white-box">
						<h4><?php _e( 'The KB Editor is not loading.', 'echo-knowledge-base' ); ?></h4>
						<?php self::get_error_form_html(); ?>
					</span>
					<div class="epkb-close-notice epkbfa epkbfa-window-close"></div>
				</div>
			</div>
		</div>		<?php
	}

	/***
	 * Error submit Form for editor
	 */
	public static function get_error_form_html() {

		$user = EPKB_Utilities::get_current_user();

		$user_first_name = empty($user) ? '' : $user->display_name;
		$usre_email = empty($user) ? '' : $user->user_email;  ?>

		<div class="epkb-editor-error--form-wrap">
			<div class="epkb-editor-error--form-message-1"></div>
			<div class="epkb-editor-error--form-message-2"><?php _e( 'We have detected errors on your website caused by your other plugins or website configuration. ' .
		                                                            'These errors could be causing other issues on your website. Let us help you fix your website errors.', 'echo-knowledge-base' ); ?></div>
			<form id="epkb-editor-error--form" method="post">				<?php
				wp_nonce_field( '_epkb_editor_submit_error_form_nonce' );				?>
				<input type="hidden" name="action" value="epkb_editor_error" />
				<div id="epkb-editor-error--form-body">

					<label for="epkb-editor-error--form-first_name"><?php _e( 'Name', 'echo-knowledge-base' ); ?>*</label>
					<input name="first_name" type="text" value="<?php echo $user_first_name; ?>" required  id="epkb-editor-error--form-first_name">

					<label for="epkb-editor-error--form-email"><?php _e( 'Email', 'echo-knowledge-base' ); ?>*</label>
					<input name="email" type="email" value="<?php echo $usre_email; ?>" required id="epkb-editor-error--form-email">

					<label for="epkb-editor-error--form-editor_error"><?php _e( 'Error Details', 'echo-knowledge-base' ); ?>*</label>
					<textarea name="editor_error" class="editor_error" required id="epkb-editor-error--form-editor_error"></textarea>

					<div class="epkb-editor-error--form-btn-wrap">
						<input type="submit" name="submit_error" value="<?php _e( 'Submit', 'echo-knowledge-base' ); ?>" class="epkb-editor-error--form-btn">
						<span class="epkb-close-notice epkb-editor-error--form-btn epkb-editor-error--form-btn-cancel"><?php _e( 'Cancel', 'echo-knowledge-base' ); ?></span>
					</div>
					
					<div class="epkb-editor-error--form-response"></div>
				</div>
			</form>
		</div> <?php
	}

	/**
	 * EDITOR - Current vs KB Template and Layouts
	 *
	 * @param $kb_config
	 * @return false|string
	 */
	public static function get_editor_settings_html( $kb_config ) {
		ob_start();

		$editor_urls = EPKB_Utilities::get_editor_urls( $kb_config );		?>

		<div class="epkb-editor-settings-panel-container" id="epkb-editor-settings-templates">
			<div class="epkb-editor-settings-accordeon-item__title"><?php _e( 'Choose Template for KB', 'echo-knowledge-base' ); ?></div>
			<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-image-select">
				<label class="epkb-editor-settings-control-image-select" data-name="templates_for_kb">
					<input type="radio" name="templates_for_kb" value="current_theme_templates">

					<div class="epkb-editor-settings-control-image-select--label">
						<img src="<?php echo Echo_Knowledge_Base::$plugin_url.'img/editor/current-theme-option.jpg'; ?>">
						<span><?php _e( 'Current Template', 'echo-knowledge-base' ); ?></span>
					</div>
				</label>

				<label class="epkb-editor-settings-control-image-select" data-name="templates_for_kb">
					<input type="radio" name="templates_for_kb" value="kb_templates">

					<div class="epkb-editor-settings-control-image-select--label">
						<img src="<?php echo Echo_Knowledge_Base::$plugin_url.'img/editor/kb-template-option.jpg'; ?>">
						<span><?php _e( 'Knowledge Base Template', 'echo-knowledge-base' ); ?></span>
					</div>
				</label>
			</div>
			<div class="epkb-editor-settings-accordeon-item__description">
			 <?php _e( 'Choose the template that works best for you.', 'echo-knowledge-base' ); ?>

				<div class="epkb-editor-settings__desc-links-container">
					<p>The template controls the style of these pages:</p>
					<a href="<?php echo esc_url( $editor_urls['main_page_url'] ); ?>" target="_blank" class="epkb-editor-settings__desc-link"><?php _e( 'Main Page', 'echo-knowledge-base' ); ?></a>
					<a href="<?php echo esc_url( $editor_urls['article_page_url'] ); ?>" target="_blank" class="epkb-editor-settings__desc-link"><?php _e( 'Article Page', 'echo-knowledge-base' ); ?></a>
					<a href="<?php echo esc_url( $editor_urls['archive_url'] ); ?>" target="_blank" class="epkb-editor-settings__desc-link"><?php _e( 'Archive Page', 'echo-knowledge-base' ); ?></a>
					<p>Switch the template, save it, and reload each page to see the change.</p>
					<p><?php _e( 'You can change the template at any time.', 'echo-knowledge-base' ); ?> <a href="https://www.echoknowledgebase.com/documentation/current-theme-template-vs-kb-template/" target="_blank"><?php _e( 'Learn More', 'echo-knowledge-base' ); ?></a></p>
				</div>

			</div>
		</div>

		<div class="epkb-editor-settings-panel-container"  id="epkb-editor-settings-layouts">
			<div class="epkb-editor-settings-accordeon-item__title"><?php _e( 'Choose a Layout and save it', 'echo-knowledge-base' ); ?></div>
			<div class="epkb-editor-settings-control-container epkb-editor-settings-control-type-image-select">
				<label class="epkb-editor-settings-control-image-select" data-name="kb_main_page_layout">
					<input type="radio" name="kb_main_page_layout" value="Basic">

					<div class="epkb-editor-settings-control-image-select--label">
						<img src="<?php echo Echo_Knowledge_Base::$plugin_url.'img/editor/basic-layout-dark.jpg'; ?>">
						<span><?php _e( 'Basic', 'echo-knowledge-base' ); ?></span>
					</div>
				</label>

				<label class="epkb-editor-settings-control-image-select" data-name="kb_main_page_layout">
					<input type="radio" name="kb_main_page_layout" value="Tabs">

					<div class="epkb-editor-settings-control-image-select--label">
						<img src="<?php echo Echo_Knowledge_Base::$plugin_url.'img/editor/tabs-layout.jpg'; ?>">
						<span><?php _e( 'Tabs', 'echo-knowledge-base' ); ?></span>
					</div>
				</label>

				<label class="epkb-editor-settings-control-image-select" data-name="kb_main_page_layout">
					<input type="radio" name="kb_main_page_layout" value="Categories">

					<div class="epkb-editor-settings-control-image-select--label">
						<img src="<?php echo Echo_Knowledge_Base::$plugin_url.'img/editor/category-focused-layout.jpg'; ?>">
						<span><?php _e( 'Category Focused', 'echo-knowledge-base' ); ?></span>
					</div>
				</label><?php

				if ( EPKB_Utilities::is_elegant_layouts_enabled() ) { ?>

					<label class="epkb-editor-settings-control-image-select" data-name="kb_main_page_layout">
						<input type="radio" name="kb_main_page_layout" value="Grid">

						<div class="epkb-editor-settings-control-image-select--label">
							<img src="<?php echo Echo_Knowledge_Base::$plugin_url.'img/editor/grid-layout.jpg'; ?>">
							<span><?php _e( 'Grid', 'echo-knowledge-base' ); ?></span>
						</div>
					</label>

					<label class="epkb-editor-settings-control-image-select" data-name="kb_main_page_layout">
						<input type="radio" name="kb_main_page_layout" value="Sidebar">

						<div class="epkb-editor-settings-control-image-select--label">
							<img src="<?php echo Echo_Knowledge_Base::$plugin_url.'img/editor/sidebar-layout.jpg'; ?>">
							<span><?php _e( 'Sidebar', 'echo-knowledge-base' ); ?></span>
						</div>
					</label><?php

				}  ?>

			</div>
		</div> <?php
		
		do_action( 'epkb_editor_settings_html' );
		
		return ob_get_clean();
	}

	/**
	 * Editor links in help menu
	 * @param $page_type
	 * @param $kb_config
	 * @return false|string
	 */
	public static function get_editor_modal_menu_links( $page_type, $kb_config ) {

		$editor_urls = EPKB_Utilities::get_editor_urls( $kb_config );

		if ( $page_type == 'main-page' ) {
			$editor_url = $editor_urls['article_page_url'];
			$menu_name = __( 'Article Page Editor', 'echo-knowledge-base' );
		} else {
			$editor_url = $editor_urls['main_page_url'];
			$menu_name = __( 'Main Page Editor', 'echo-knowledge-base' );
		}

		ob_start();	?>

		<div class="epkb-editor-settings-menu-container">
			<div class="epkb-editor-settings-menu__inner">
				<div class="epkb-editor-settings-menu__group-container">
					<div class="epkb-editor-settings-menu__group__title"><?php _e( 'Other Pages', 'echo-knowledge-base' ); ?></div>
					<div class="epkb-editor-settings-menu__group-items-container">
						<a href="<?php echo $editor_url; ?>" class="epkb-editor-settings-menu__group-item-container" target="_blank">
							<div class="epkb-editor-settings-menu__group-item__icon epkbfa epkbfa-file-text-o"></div>
							<div class="epkb-editor-settings-menu__group-item__title"><?php echo $menu_name; ?></div>
						</a>
						<a href="<?php echo admin_url( 'edit.php?post_type=' . EPKB_KB_Handler::KB_POST_TYPE_PREFIX . $kb_config['id'] . '&page=epkb-manage-kb' ); ?>" class="epkb-editor-settings-menu__group-item-container" target="_blank">
							<div class="epkb-editor-settings-menu__group-item__icon epkbfa epkbfa-cubes"></div>
							<div class="epkb-editor-settings-menu__group-item__title"><?php _e( 'Manage KBs', 'echo-knowledge-base' ); ?></div>
						</a>
					</div>
					<div class="epkb-editor-settings-menu__group__title"><?php _e( 'Help', 'echo-knowledge-base' ); ?></div>
					<div class="epkb-editor-settings-menu__group-items-container">
						<a href="https://www.echoknowledgebase.com/documentation/" class="epkb-editor-settings-menu__group-item-container" target="_blank">
							<div class="epkb-editor-settings-menu__group-item__icon epkbfa epkbfa-graduation-cap"></div>
							<div class="epkb-editor-settings-menu__group-item__title"><?php _e( 'KB Documentation', 'echo-knowledge-base' ); ?></div>
						</a>
						<a href="https://www.echoknowledgebase.com/technical-support/" class="epkb-editor-settings-menu__group-item-container" target="_blank">
							<div class="epkb-editor-settings-menu__group-item__icon epkbfa epkbfa-life-ring"></div>
							<div class="epkb-editor-settings-menu__group-item__title"><?php _e( 'Support', 'echo-knowledge-base' ); ?></div>
						</a>
					</div>
				</div>
			</div>
		</div>		<?php

		return ob_get_clean();
	}

	/**
	 * Display page template used by the frontend Editor to display its sidebar.
	 */
	public static function frontend_editor_page( ) {
		global $eckb_kb_id;
	
		if ( empty($eckb_kb_id) || ! empty( $_REQUEST['epkb-editor'] ) ) {
			return;
		}
		
		$kb_config = epkb_get_instance()->kb_config_obj->get_kb_config_or_default( $eckb_kb_id );

		$kb_config = apply_filters( 'eckb_kb_config', $kb_config );
		if ( empty($kb_config) || is_wp_error($kb_config) ) {
			return;
		}            ?>
		
		<!doctype html>
		<html <?php language_attributes(); ?>>

			<head>
				<meta charset="<?php bloginfo( 'charset' ); ?>">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<title><?php _e( 'Echo KB Editor', 'echo-knowledge-base' ); ?></title>			<?php
					wp_enqueue_scripts();
					wp_print_head_scripts(); ?>
			</head>

			<body <?php body_class(); ?>><?php
				self::get_editor_html();
		      remove_all_actions( 'wp_footer' );
				_wp_footer_scripts(); ?>
			</body>

		</html><?php
	}
}