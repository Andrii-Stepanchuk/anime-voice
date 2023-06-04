class VoiceRecorder {
    constructor() {
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
            ? console.log("getUserMedia supported")
            : console.log("getUserMedia is not supported on your browser!");


        this.lang = {
            'press_to_start': 'Press to start recording',
            'recording': 'Recording...',
            'play': 'Play',
            'stop': 'Stop',
            'download': 'Download',
        };

        this.mediaRecorder;
        this.stream;
        this.chunks = [];
        this.isRecording = false;
        this.audio = new Audio();

        this.messageBox = document.getElementById('msg_box');
        this.recordButton = document.getElementById('button');

        this.messageBox.innerHTML = this.lang.press_to_start;
        this.recordButton.onclick = this.changeRecordingStatus.bind(this);

        this.constraints = {
            audio: true,
            video: false
        }

        this.type = {
            'type': 'audio/ogg; codecs=opus'
        };
    }

    changeRecordingStatus() {
        !this.isRecording ? this.startRecording() : this.stopRecording();
    }

    startRecording() {
        this.isRecording = true;
        this.messageBox.innerHTML = 'Recording...';
        this.recordButton.classList.add('recording');
        navigator.mediaDevices
            .getUserMedia(this.constraints)
            .then(this.handleSuccess.bind(this))
            .catch(this.handleError.bind(this))
    }

    stopRecording() {
        this.isRecording = false
        this.recordButton.classList.remove('recording');
        this.mediaRecorder.stop();
        this.messageBox.innerHTML =
            '<a href="#" onclick="voiceRecorder.play();" class="txt_btn">' + this.lang.play + '</a><br>' +
            '<a href="#" onclick="voiceRecorder.save();" class="txt_btn">' + this.lang.download + '</a>';
    }

    handleSuccess(stream) {
        this.stream = stream;
        this.stream.oninactive = () => console.log("Stream ended!");
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = this.onMediaRecorderDataAvailable.bind(this);
        this.mediaRecorder.onstop = this.onMediaRecorderStop.bind(this);
        this.mediaRecorder.start();
    }

    handleError(error) {
        console.log("navigator.getUserMedia error: ", error);
    }

    onMediaRecorderDataAvailable(event) {
        this.chunks.push(event.data)
    }

    onMediaRecorderStop(event) {
        const blob = new Blob(this.chunks, this.type);
        this.audio.src = window.URL.createObjectURL(blob);
        console.log(this.audio.src);
        this.chunks = [];
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
    }

    //TODO delete temporary script
    play() {
        voiceRecorder.audio
            .play()
            .then(() => console.log("OK"))
            .catch((e) => console.log(e));
        this.messageBox.innerHTML =
            '<a href="#" onclick="voiceRecorder.pause();" class="txt_btn">' + this.lang.stop + '</a><br>' +
            '<a href="#" onclick="voiceRecorder.save();" class="txt_btn">' + this.lang.download + '</a>';
    }

    pause() {
        this.audio.pause();
        this.messageBox.innerHTML =
            '<a href="#" onclick="voiceRecorder.play();" class="txt_btn">' + this.lang.play + '</a><br>' +
            '<a href="#" onclick="voiceRecorder.save();" class="txt_btn">' + this.lang.download + '</a>';
    }

    save() {
        const a = document.createElement('a');
        console.log(voiceRecorder.chunks)
        a.download = 'record.ogg';
        a.href = voiceRecorder.audio.src;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

window.voiceRecorder = new VoiceRecorder();
