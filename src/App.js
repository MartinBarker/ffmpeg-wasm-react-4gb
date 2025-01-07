import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';

function App() {
  const [videoSrc, setVideoSrc] = useState('');
  const [message, setMessage] = useState('Click Start to transcode');
  const [audioFiles, setAudioFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const ffmpeg = createFFmpeg({
    log: true,
  });

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const audio = files.filter(file => file.type.startsWith('audio/'));
    const images = files.filter(file => file.type.startsWith('image/'));
    setAudioFiles(audio);
    setImageFiles(images);
  };

  const renderVideo = async () => {
    if (audioFiles.length === 0 || imageFiles.length === 0) {
      setMessage('Please select at least one audio and one image file.');
      return;
    }

    setMessage('Loading ffmpeg-core.js');
    await ffmpeg.load();
    setMessage('Start rendering video');

    const audioFile = audioFiles[0];
    const imageFile = imageFiles[0];

    ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(URL.createObjectURL(audioFile)));
    ffmpeg.FS('writeFile', 'image.jpg', await fetchFile(URL.createObjectURL(imageFile)));

    const command = ['-loop', '1', '-framerate', '2', '-i', 'image.jpg', '-i', 'audio.mp3', '-c:v', 'libx264', '-preset', 'slow', '-tune', 'stillimage', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-shortest', 'output.mp4'];
    console.log('Running ffmpeg command:', command.join(' '));

    await ffmpeg.run(...command);

    setMessage('Complete rendering video');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));
  };

  return (
    <div className="App">
      <input type="file" multiple onChange={handleFileChange} />
      <div>
        <h3>Audio Files</h3>
        <table>
          <tbody>
            {audioFiles.map((file, index) => (
              <tr key={index}>
                <td>{file.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3>Image Files</h3>
        <table>
          <tbody>
            {imageFiles.map((file, index) => (
              <tr key={index}>
                <td>{file.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <video src={videoSrc} controls></video><br/>
      <button onClick={renderVideo}>Render Video</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
