
window.addEventListener('DOMContentLoaded', () => {
  // Determine mode and form
  const encryptForm = document.getElementById('encryptForm');
  const decryptForm = document.getElementById('decryptForm');
  const form = encryptForm || decryptForm;
  if (!form) return; // No form found

  const mode = encryptForm ? 'encrypt' : 'decrypt';
  const resultDiv = document.getElementById('result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form fields
    const mediaType = document.getElementById('mediaType').value;
    const fileInput = document.getElementById('fileInput');
    const rValue = document.getElementById('rInput').value.trim();
    const keyValue = document.getElementById('keyInput').value.trim();

    if (!mediaType || !fileInput.files.length || !rValue || !keyValue) {
      alert('Please fill all fields and select a file.');
      return;
    }

    const file = fileInput.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File exceeds 5MB size limit.');
      return;
    }

    const fileType = file.type;

    if (mediaType === 'audio' && !fileType.startsWith('audio/')) {
      alert(`Mismatch: You selected "Audio" but uploaded a file of type ${fileType}`);
      return;
    }
    if (mediaType === 'video' && !fileType.startsWith('video/')) {
      alert(`Mismatch: You selected "Video" but uploaded a file of type ${fileType}`);
      return;
    }
    if (mediaType === 'image' && !fileType.startsWith('image/')) {
      alert(`Mismatch: You selected "Image" but uploaded a file of type ${fileType}`);
      return;
    }



    // Prepare FormData
    const fd = new FormData();
    fd.append('file', file);
    fd.append('r', rValue);
    fd.append('key', keyValue);

    try {
      // Send POST request
      const response = await fetch(`http://localhost:5000/api/${mode}/${mediaType}`, {
        method: 'POST',
        body: fd
      });
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Get response as Blob
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);

      // Clear previous result
      resultDiv.innerHTML = '';

      // Create appropriate media element for preview
      if (mediaType === 'image') {
        const img = document.createElement('img');
        img.src = objectURL;
        img.alt = 'Resulting image';
        resultDiv.appendChild(img);
      } else if (mediaType === 'audio') {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = objectURL;
        resultDiv.appendChild(audio);
      } else if (mediaType === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.src = objectURL;
        resultDiv.appendChild(video);
      }

      // Create download link
      const link = document.createElement('a');
      link.href = objectURL;
      // Name the downloaded file
      link.download = `${mode === 'encrypt' ? 'encrypted_' : 'decrypted_'}${file.name}`;
      link.textContent = `${mode === 'encrypt' ? 'Download Encrypted' : 'Download Decrypted'} File`;
      link.className = 'download-link';
      resultDiv.appendChild(link);

    } catch (err) {
      console.error(err);
      alert('An error occurred: ' + err.message);
    }
  });
});
