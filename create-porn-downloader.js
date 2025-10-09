// ==UserScript==
// @name         Add Download Buttons for GIF Videos
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds a download button to the bottom-right corner of each GIF video on CreatePorn.com, allowing direct MP4 download using blob fetching.
// @author       Grok
// @match        https://www.createporn.com/*
// @grant        GM_xmlhttpRequest
// @connect      cdn7.imgpog.com
// ==/UserScript==

(function() {
    'use strict';

    // Function to create and style the download button
    function createDownloadButton(videoSrc) {
        const button = document.createElement('button');
        button.innerText = 'Download MP4';
        button.style.position = 'absolute';
        button.style.bottom = '10px';
        button.style.right = '10px';
        button.style.zIndex = '1000';
        button.style.backgroundColor = '#007bff';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '5px 10px';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.opacity = '0.8';
        button.style.transition = 'opacity 0.3s';
        button.onmouseover = () => button.style.opacity = '1';
        button.onmouseout = () => button.style.opacity = '0.8';

        // Handle download using GM_xmlhttpRequest to fetch video as blob
        button.onclick = (e) => {
            e.stopPropagation()
            e.preventDefault()
            button.innerText = 'Downloading...';
            button.disabled = true;

            GM_xmlhttpRequest({
                method: 'GET',
                url: videoSrc,
                responseType: 'blob',
                onload: function(response) {
                    if (response.status === 200) {
                        const blob = response.response;
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = videoSrc.split('/').pop() || 'video.mp4';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                    } else {
                        alert('Failed to download video. Status: ' + response.status);
                    }
                    button.innerText = 'Download MP4';
                    button.disabled = false;
                },
                onerror: function() {
                    alert('Error downloading video. Please try again.');
                    button.innerText = 'Download MP4';
                    button.disabled = false;
                }
            });
        };

        return button;
    }

    // Function to add download buttons to all video elements
    function addDownloadButtons() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            // Check if the video already has a download button
            if (!video.parentElement.querySelector('button')) {
                const videoSrc = video.querySelector('source')?.src || video.src;
                if (videoSrc && (videoSrc.includes('.mp4') || videoSrc.includes('.webm'))) {
                    const container = video.parentElement;
                    container.style.position = 'relative'; // Ensure the container allows absolute positioning
                    const downloadButton = createDownloadButton(videoSrc);
                    container.appendChild(downloadButton);
                }
            }
        });
    }

    // Run the function initially
    addDownloadButtons();

    // Observe DOM changes to handle dynamically loaded videos
    const observer = new MutationObserver(() => {
        addDownloadButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();