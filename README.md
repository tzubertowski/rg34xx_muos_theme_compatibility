# Anbernic RG34XX & RG CUBEXX MuOS Theme Converter

A simple web-based tool to convert MuOS theme files (.muxthm) for Anbernic RG34XX (3:2 aspect ratio) and RG CUBEXX (1:1 aspect ratio) devices. This tool helps you adapt themes originally designed for the 4:3 aspect ratio (640x480) to work properly on newer devices.

![Theme Converter Tool](screenshots/theme-converter.png)

## 🚀 Features

- **Multi-device support**: Convert themes for both RG34XX (720x480) and RG CUBEXX (720x720) devices
- **Batch conversion**: Process multiple theme files at once
- **Multiple conversion methods**:
  - **Zoom**: Fill the entire frame (may crop parts of the image)
  - **Crop**: Crop from center to fit the new aspect ratio
  - **Fit**: Keep the entire image and add black bars if needed
- **Smart resolution handling**:
  - Only resizes images that are exactly 640x480 pixels
  - Preserves all other graphics intact
- **Preserves original files**:
  - Keeps the original 640x480 folder completely unchanged
  - Creates a new folder (720x480 or 720x720) with the converted images
- **Device-specific logo support**:
  - Uses logocube.png instead of logo.png for RG CUBEXX themes
- **Config file updates**:
  - Automatically updates all .ini files with new resolution values
- **No server processing**:
  - Everything happens in your browser - files never leave your computer
  - Works even offline after the page is loaded

## 💻 Usage

1. Visit [https://your-hosted-url-here.com](https://your-hosted-url-here.com)
2. Select your device (RG34XX or RG CUBEXX)
3. Choose your conversion method (Zoom, Crop, or Fit)
4. Drag and drop one or multiple .muxthm files onto the upload area
5. Click "Convert Theme"
6. The converted themes will download automatically when finished

## ℹ️ How It Works

The converter:

1. Extracts the contents of the .muxthm file (which is a renamed .zip)
2. Keeps all original files intact
3. Creates a new folder with the proper resolution for your device (720x480 or 720x720)
4. Converts all 640x480 images to the new resolution using your selected method
5. Updates .ini files to reference the new resolution
6. Packages everything back into a new .muxthm file

## 🔧 Technical Details

- The tool runs entirely in the browser using JavaScript
- Uses the JSZip library to process .muxthm files
- Uses HTML5 Canvas for image resizing and format conversion
- Leverages localStorage to remember your device preference
- Nothing is uploaded to any server - all processing happens locally

## 📋 Recommended Theme Conversion Practices

- **Experiment with different methods**: Try all three conversion methods (zoom, crop, fit) to see which works best for a particular theme
- **Check backgrounds carefully**: Background images often benefit from the "zoom" method
- **For icons and UI elements**: The "fit" method usually preserves more detail
- **For RG CUBEXX**: Consider creating dedicated square assets named "logocube.png" for the best appearance

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Thanks to the MuOS community for their support
- JSZip library for ZIP file processing
- FileSaver.js for handling file downloads

## 📬 Contact

If you have any questions or suggestions, please open an issue on this repository.

---

*This tool is not officially affiliated with Anbernic or MuOS developers.*