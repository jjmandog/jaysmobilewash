/**
 * Jay's Mobile Wash - Audio Player with Beat Synchronization
 * Version: 1.0.0
 * Last Updated: 2025-06-30
 */

class JayAudioPlayer {
    constructor(options = {}) {
        // Audio player configuration
        this.config = {
            autoplay: options.autoplay || false,
            volume: options.volume !== undefined ? options.volume : 0.5,
            muted: options.muted || false,
            loop: options.loop || true,
            visualizer: options.visualizer !== undefined ? options.visualizer : true,
            beatDetection: options.beatDetection !== undefined ? options.beatDetection : true,
            playlistVisible: options.playlistVisible || false,
            defaultSong: options.defaultSong || 'audio/jay-mobile-wash-theme.mp3',
            analyzerFftSize: options.analyzerFftSize || 2048,
            smoothingTimeConstant: options.smoothingTimeConstant || 0.8,
            beatSensitivity: options.beatSensitivity || 1.2,
            theme: options.theme || 'dark',
            visualizerColor: options.visualizerColor || 'gradient'
        };

        // DOM elements
        this.player = document.getElementById('audio-player') || this.createPlayerElement();
        this.canvas = document.getElementById('audio-visualizer') || this.createVisualizerElement();
        this.playButton = document.querySelector('.audio-play') || this.createControlElement('play');
        this.pauseButton = document.querySelector('.audio-pause') || this.createControlElement('pause');
        this.nextButton = document.querySelector('.audio-next') || this.createControlElement('next');
        this.prevButton = document.querySelector('.audio-prev') || this.createControlElement('prev');
        this.muteButton = document.querySelector('.audio-mute') || this.createControlElement('mute');
        this.volumeSlider = document.querySelector('.audio-volume') || this.createControlElement('volume');
        this.progressBar = document.querySelector('.audio-progress') || this.createControlElement('progress');
        this.currentTime = document.querySelector('.audio-current-time') || this.createControlElement('current-time');
        this.duration = document.querySelector('.audio-duration') || this.createControlElement('duration');
        this.playlistButton = document.querySelector('.audio-playlist-toggle') || this.createControlElement('playlist-toggle');
        this.playlist = document.querySelector('.audio-playlist') || this.createPlaylistElement();
        
        // Audio context
        this.audioContext = null;
        this.audioSource = null;
        this.analyser = null;
        this.gainNode = null;
        this.audioData = null;
        
        // Beat detection variables
        this.beatDetector = null;
        this.beatTime = 0;
        this.beatCutOff = 0;
        this.beatDecayRate = 0.98;
        this.beatMinimum = 0.15;
        this.beatTriggerEvent = new Event('beat');
        
        // Playlist data
        this.songs = [
            {
                title: "Jay's Mobile Wash Theme",
                artist: "JJ Productions",
                file: "audio/jay-mobile-wash-theme.mp3",
                cover: "images/song-cover-1.webp"
            },
            {
                title: "Detailing Excellence",
                artist: "Car Audio Collective",
                file: "audio/detailing-excellence.mp3",
                cover: "images/song-cover-2.webp"
            },
            {
                title: "Clean Ride",
                artist: "Mobile Beats",
                file: "audio/clean-ride.mp3",
                cover: "images/song-cover-3.webp"
            }
        ];
        this.currentSongIndex = 0;
        
        // State variables
        this.isPlaying = false;
        this.isMuted = this.config.muted;
        this.canvasContext = this.canvas.getContext('2d');
        this.animationId = null;
        
        // Initialize the player
        this.init();
    }
    
    // Initialize the audio player
    init() {
        // Set up audio context
        this.initAudioContext();
        
        // Load first song
        this.loadSong(this.currentSongIndex);
        
        // Set up volume
        this.player.volume = this.config.volume;
        this.volumeSlider.value = this.config.volume * 100;
        
        // Set muted state
        this.player.muted = this.config.muted;
        this.updateMuteButton();
        
        // Set loop state
        this.player.loop = this.config.loop;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Populate playlist
        this.populatePlaylist();
        
        // If autoplay, start playing
        if (this.config.autoplay) {
            this.play();
        }
        
        // Initialize visualizer
        if (this.config.visualizer) {
            this.initVisualizer();
        } else {
            this.canvas.style.display = 'none';
        }
        
        console.log('Jay Audio Player initialized successfully');
    }
    
    // Create player element if it doesn't exist
    createPlayerElement() {
        const audioElement = document.createElement('audio');
        audioElement.id = 'audio-player';
        audioElement.className = 'audio-element';
        audioElement.preload = 'metadata';
        
        // Append to body or a container element
        const container = document.querySelector('.audio-player-container') || document.body;
        container.appendChild(audioElement);
        
        return audioElement;
    }
    
    // Create visualizer canvas if it doesn't exist
    createVisualizerElement() {
        const container = document.querySelector('.audio-player-container') || document.body;
        const visualizerContainer = document.createElement('div');
        visualizerContainer.className = 'audio-visualizer-container';
        
        const canvas = document.createElement('canvas');
        canvas.id = 'audio-visualizer';
        canvas.className = 'audio-visualizer';
        canvas.width = 300;
        canvas.height = 100;
        
        visualizerContainer.appendChild(canvas);
        container.appendChild(visualizerContainer);
        
        return canvas;
    }
    
    // Create control element if it doesn't exist
    createControlElement(type) {
        const container = document.querySelector('.audio-controls') || this.createControlsContainer();
        let element;
        
        switch(type) {
            case 'play':
                element = document.createElement('button');
                element.className = 'audio-control audio-play';
                element.innerHTML = '<i class="fas fa-play"></i>';
                break;
                
            case 'pause':
                element = document.createElement('button');
                element.className = 'audio-control audio-pause';
                element.innerHTML = '<i class="fas fa-pause"></i>';
                element.style.display = 'none';
                break;
                
            case 'next':
                element = document.createElement('button');
                element.className = 'audio-control audio-next';
                element.innerHTML = '<i class="fas fa-forward"></i>';
                break;
                
            case 'prev':
                element = document.createElement('button');
                element.className = 'audio-control audio-prev';
                element.innerHTML = '<i class="fas fa-backward"></i>';
                break;
                
            case 'mute':
                element = document.createElement('button');
                element.className = 'audio-control audio-mute';
                element.innerHTML = '<i class="fas fa-volume-up"></i>';
                break;
                
            case 'volume':
                element = document.createElement('input');
                element.type = 'range';
                element.className = 'audio-volume';
                element.min = 0;
                element.max = 100;
                element.value = this.config.volume * 100;
                break;
                
            case 'progress':
                element = document.createElement('div');
                element.className = 'audio-progress-container';
                
                const progress = document.createElement('div');
                progress.className = 'audio-progress';
                
                const bar = document.createElement('div');
                bar.className = 'audio-progress-bar';
                
                progress.appendChild(bar);
                element.appendChild(progress);
                break;
                
            case 'current-time':
                element = document.createElement('div');
                element.className = 'audio-time audio-current-time';
                element.innerHTML = '0:00';
                break;
                
            case 'duration':
                element = document.createElement('div');
                element.className = 'audio-time audio-duration';
                element.innerHTML = '0:00';
                break;
                
            case 'playlist-toggle':
                element = document.createElement('button');
                element.className = 'audio-control audio-playlist-toggle';
                element.innerHTML = '<i class="fas fa-list"></i>';
                break;
        }
        
        container.appendChild(element);
        return element;
    }
    
    // Create controls container if it doesn't exist
    createControlsContainer() {
        const playerContainer = document.querySelector('.audio-player-container');
        
        if (!playerContainer) {
            // Create main container
            const mainContainer = document.createElement('div');
            mainContainer.className = 'audio-player-container';
            
            document.body.appendChild(mainContainer);
        }
        
        const container = document.createElement('div');
        container.className = 'audio-controls';
        
        document.querySelector('.audio-player-container').appendChild(container);
        return container;
    }
    
    // Create playlist element if it doesn't exist
    createPlaylistElement() {
        const container = document.querySelector('.audio-player-container') || document.body;
        
        const playlistContainer = document.createElement('div');
        playlistContainer.className = 'audio-playlist-container';
        
        const playlistHeader = document.createElement('div');
        playlistHeader.className = 'audio-playlist-header';
        playlistHeader.innerHTML = '<h3>Playlist</h3>';
        
        const playlist = document.createElement('ul');
        playlist.className = 'audio-playlist';
        
        playlistContainer.appendChild(playlistHeader);
        playlistContainer.appendChild(playlist);
        
        if (!this.config.playlistVisible) {
            playlistContainer.style.display = 'none';
        }
        
        container.appendChild(playlistContainer);
        return playlist;
    }
    
    // Initialize Web Audio API context
    initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create analyzer node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.config.analyzerFftSize;
            this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
            
            // Create gain node
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.config.volume;
            
            // Connect audio source to analyzer node
            this.audioSource = this.audioContext.createMediaElementSource(this.player);
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            // Create data array for analyzer
            this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
            
            console.log('Audio context initialized successfully');
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
        }
    }
    
    // Set up event listeners for controls
    setupEventListeners() {
        // Play button
        this.playButton.addEventListener('click', () => {
            this.play();
        });
        
        // Pause button
        this.pauseButton.addEventListener('click', () => {
            this.pause();
        });
        
        // Next button
        this.nextButton.addEventListener('click', () => {
            this.next();
        });
        
        // Previous button
        this.prevButton.addEventListener('click', () => {
            this.prev();
        });
        
        // Mute button
        this.muteButton.addEventListener('click', () => {
            this.toggleMute();
        });
        
        // Volume slider
        this.volumeSlider.addEventListener('input', () => {
            this.setVolume(this.volumeSlider.value / 100);
        });
        
        // Progress bar
        this.progressBar.parentNode.addEventListener('click', (e) => {
            const rect = this.progressBar.parentNode.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.player.currentTime = this.player.duration * percent;
        });
        
        // Playlist button
        this.playlistButton.addEventListener('click', () => {
            this.togglePlaylist();
        });
        
        // Audio playback events
        this.player.addEventListener('timeupdate', () => {
            this.updateProgress();
        });
        
        this.player.addEventListener('ended', () => {
            if (!this.player.loop) {
                this.next();
            }
        });
        
        this.player.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });
        
        // Space bar play/pause
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }
    
    // Load song by index
    loadSong(index) {
        if (index < 0) {
            index = this.songs.length - 1;
        } else if (index >= this.songs.length) {
            index = 0;
        }
        
        this.currentSongIndex = index;
        const song = this.songs[index];
        
        // Update audio source
        this.player.src = song.file;
        this.player.load();
        
        // Update active class in playlist
        this.updateActivePlaylistItem();
        
        console.log(`Loaded song: ${song.title} - ${song.artist}`);
    }
    
    // Play current song
    play() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.player.play();
        this.isPlaying = true;
        this.playButton.style.display = 'none';
        this.pauseButton.style.display = 'inline-block';
        
        // Trigger beat detection
        if (this.config.beatDetection && !this.animationId) {
            this.detectBeats();
        }
    }
    
    // Pause current song
    pause() {
        this.player.pause();
        this.isPlaying = false;
        this.pauseButton.style.display = 'none';
        this.playButton.style.display = 'inline-block';
        
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // Toggle play/pause
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    // Play next song
    next() {
        this.loadSong(this.currentSongIndex + 1);
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    // Play previous song
    prev() {
        // If current time > 3 seconds, restart song instead of previous
        if (this.player.currentTime > 3) {
            this.player.currentTime = 0;
        } else {
            this.loadSong(this.currentSongIndex - 1);
            
            if (this.isPlaying) {
                this.play();
            }
        }
    }
    
    // Toggle mute
    toggleMute() {
        this.player.muted = !this.player.muted;
        this.updateMuteButton();
    }
    
    // Update mute button icon
    updateMuteButton() {
        if (this.player.muted) {
            this.muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            this.muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
    
    // Set volume (0-1)
    setVolume(volume) {
        this.player.volume = volume;
        this.gainNode.gain.value = volume;
        this.volumeSlider.value = volume * 100;
        
        // Unmute if volume is changed
        if (volume > 0 && this.player.muted) {
            this.player.muted = false;
            this.updateMuteButton();
        }
    }
    
    // Update progress bar
    updateProgress() {
        const progress = (this.player.currentTime / this.player.duration) * 100 || 0;
        this.progressBar.style.width = `${progress}%`;
        
        // Update current time display
        this.currentTime.textContent = this.formatTime(this.player.currentTime);
    }
    
    // Update duration display
    updateDuration() {
        this.duration.textContent = this.formatTime(this.player.duration);
    }
    
    // Format time in MM:SS
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    // Toggle playlist visibility
    togglePlaylist() {
        const playlistContainer = document.querySelector('.audio-playlist-container');
        
        if (playlistContainer.style.display === 'none') {
            playlistContainer.style.display = 'block';
        } else {
            playlistContainer.style.display = 'none';
        }
    }
    
    // Populate playlist items
    populatePlaylist() {
        this.playlist.innerHTML = '';
        
        this.songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'audio-playlist-item';
            if (index === this.currentSongIndex) {
                li.classList.add('active');
            }
            
            li.innerHTML = `
                <div class="playlist-item-cover">
                    <img src="${song.cover}" alt="${song.title}">
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${song.title}</div>
                    <div class="playlist-item-artist">${song.artist}</div>
                </div>
                <div class="playlist-item-duration"></div>
            `;
            
            li.addEventListener('click', () => {
                this.loadSong(index);
                this.play();
            });
            
            this.playlist.appendChild(li);
        });
    }
    
    // Update active class in playlist
    updateActivePlaylistItem() {
        const items = this.playlist.querySelectorAll('.audio-playlist-item');
        
        items.forEach((item, index) => {
            if (index === this.currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Initialize audio visualizer
    initVisualizer() {
        // Set canvas dimensions
        const resize = () => {
            this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
            this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
        };
        
        resize();
        window.addEventListener('resize', resize);
        
        // Start animation loop
        this.drawVisualizer();
    }
    
    // Draw the visualizer animation frame
    drawVisualizer() {
        if (!this.isPlaying) {
            this.animationId = requestAnimationFrame(this.drawVisualizer.bind(this));
            return;
        }
        
        this.analyser.getByteFrequencyData(this.audioData);
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barCount = width / 4;
        const barWidth = width / barCount;
        
        // Clear canvas
        this.canvasContext.clearRect(0, 0, width, height);
        
        // Draw visualization based on theme
        if (this.config.visualizerColor === 'gradient') {
            this.drawGradientVisualizer(barWidth, barCount);
        } else {
            this.drawSolidVisualizer(barWidth, barCount);
        }
        
        // Detect beats
        if (this.config.beatDetection) {
            this.detectBeatFromAudioData();
        }
        
        // Continue animation loop
        this.animationId = requestAnimationFrame(this.drawVisualizer.bind(this));
    }
    
    // Draw visualizer with gradient colors
    drawGradientVisualizer(barWidth, barCount) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Create gradient
        const gradient = this.canvasContext.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#4f46e5');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#ec4899');
        
        this.canvasContext.fillStyle = gradient;
        
        // Draw bars
        for (let i = 0; i < barCount; i++) {
            const x = i * barWidth;
            const barHeight = this.audioData[i] * (height / 255) * 0.8;
            
            // Round corners with rect+arc
            this.canvasContext.beginPath();
            this.roundRect(x, height - barHeight, barWidth - 2, barHeight, 3);
            this.canvasContext.fill();
        }
    }
    
    // Draw visualizer with solid color
    drawSolidVisualizer(barWidth, barCount) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.canvasContext.fillStyle = this.config.theme === 'dark' ? '#4f46e5' : '#a855f7';
        
        // Draw bars
        for (let i = 0; i < barCount; i++) {
            const x = i * barWidth;
            const barHeight = this.audioData[i] * (height / 255) * 0.8;
            
            // Round corners with rect+arc
            this.canvasContext.beginPath();
            this.roundRect(x, height - barHeight, barWidth - 2, barHeight, 3);
            this.canvasContext.fill();
        }
    }
    
    // Helper function to draw rounded rectangles
    roundRect(x, y, width, height, radius) {
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(x + radius, y);
        this.canvasContext.lineTo(x + width - radius, y);
        this.canvasContext.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.canvasContext.lineTo(x + width, y + height);
        this.canvasContext.lineTo(x, y + height);
        this.canvasContext.lineTo(x, y + radius);
        this.canvasContext.quadraticCurveTo(x, y, x + radius, y);
        this.canvasContext.closePath();
    }
    
    // Detect beats from audio data
    detectBeatFromAudioData() {
        // Get average bass frequency magnitude
        let sum = 0;
        let count = 0;
        
        // Focus on bass frequencies (0-10)
        const bassRange = Math.min(10, this.audioData.length);
        
        for (let i = 0; i < bassRange; i++) {
            sum += this.audioData[i];
            count++;
        }
        
        const average = sum / count;
        const normalized = average / 256;
        
        // Detect beat using adaptive threshold
        if (normalized > this.beatCutOff && normalized > this.beatMinimum) {
            // Beat detected
            document.dispatchEvent(this.beatTriggerEvent);
            
            // Set new cutoff slightly above current volume
            this.beatCutOff = normalized * 1.1;
            this.beatTime = Date.now();
            
            // Flash canvas on beat
            this.canvas.classList.add('beat-flash');
            setTimeout(() => {
                this.canvas.classList.remove('beat-flash');
            }, 200);
            
            // Update beat-reactive elements
            const beatElements = document.querySelectorAll('.beat-reactive');
            beatElements.forEach(el => {
                el.classList.add('on-beat');
                setTimeout(() => {
                    el.classList.remove('on-beat');
                }, 300);
            });
            
            // Trigger global beat event for other components
            if (window.jayAudio) {
                window.jayAudio.triggerBeat(normalized);
            }
        }
        
        // Adjust beat cutoff over time
        const timeSinceBeat = (Date.now() - this.beatTime) / 1000;
        this.beatCutOff *= Math.pow(this.beatDecayRate, timeSinceBeat);
        this.beatCutOff = Math.max(this.beatCutOff, this.beatMinimum);
    }
    
    // Public API methods
    
    // Get current song info
    getCurrentSong() {
        return this.songs[this.currentSongIndex];
    }
    
    // Set playlist
    setPlaylist(playlist) {
        this.songs = playlist;
        this.currentSongIndex = 0;
        this.loadSong(0);
        this.populatePlaylist();
    }
    
    // Add song to playlist
    addSong(song) {
        this.songs.push(song);
        this.populatePlaylist();
    }
    
    // Remove song from playlist
    removeSong(index) {
        if (index >= 0 && index < this.songs.length) {
            this.songs.splice(index, 1);
            
            if (index === this.currentSongIndex) {
                // If current song is removed, load next song
                this.loadSong(Math.min(index, this.songs.length - 1));
            } else if (index < this.currentSongIndex) {
                // If a song before current is removed, adjust current index
                this.currentSongIndex--;
            }
            
            this.populatePlaylist();
        }
    }
    
    // Skip to specific time
    skipTo(time) {
        if (time >= 0 && time <= this.player.duration) {
            this.player.currentTime = time;
        }
    }
}

// Initialize audio player when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create audio player container if it doesn't exist
    if (!document.querySelector('.audio-player-container')) {
        const container = document.createElement('div');
        container.className = 'audio-player-container';
        document.body.appendChild(container);
    }
    
    // Initialize the audio player
    window.jayAudioPlayer = new JayAudioPlayer({
        autoplay: false,
        volume: 0.5,
        muted: false,
        loop: true,
        visualizer: true,
        beatDetection: true,
        theme: 'dark',
        visualizerColor: 'gradient'
    });
    
    // Connect to the beat system
    if (window.jayAudio) {
        // Listen for beat events from the audio player
        document.addEventListener('beat', function(e) {
            // Trigger beat in the main audio reactive system
            window.jayAudio.triggerBeat(0.8);
        });
    }
    
    console.log('Audio Player initialized with beat synchronization');
});
