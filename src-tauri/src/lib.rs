#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      use tauri::Manager;
      let window = app.get_webview_window("main").expect("main window not found");
      if let Ok(Some(monitor)) = window.current_monitor() {
        let size = monitor.size();
        let min_w = (size.width as f64 * 0.7) as u32;
        let min_h = (size.height as f64 * 0.7) as u32;
        let _ = window.set_min_size(Some(tauri::PhysicalSize::new(min_w, min_h)));
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
