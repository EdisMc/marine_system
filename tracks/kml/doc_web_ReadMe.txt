You can upload the entire mosaic folder (SonarTRX-R00129-20200527-164559) to the web,
and share the doc_web.kml without having to distribute all the mosaic images.

You have not yet defined a URL for your mosaic folders, so you would need to manually
replace the 'URLTOKEN' with a valid url. For future use, press F2 in SonarTRX to define a valid URL,
so you can avoid this step.

1. Open doc_web.kml.txt with Notepad or other text editor.
2. Replace all occurences of the string: 'URLTOKEN' with the URL of your web servers parent mosaic folder.
   Example: Replace 'URLTOKEN' with 'http://www.yourdomain.com/SideScanSamples'
3. Use FTP program to upload the mosaic folder to: http://www.yourdomain.com/SideScanSamples
4. Rename the doc_web.kml.txt to doc_web.kml (since it should now have valid URL's to the images)

You should now be able to share the above kml file without having to distribute all the mosaic images.

Please contact support@sonartrx.com if you have problems with any of this.