if(!customElements.get('audio-source-synthesizer')) {
    class SynthesizerInstrument extends HTMLElement {
        // get DEFAULT_SAMPLE_LIBRARY_URL() { return '/sample/index.library.json'; }
        get DEFAULT_SAMPLE_LIBRARY_URL() {
            return this.getScriptDirectory('sample/sample.library.json');
        }

        get DEFAULT_INSTRUMENT_LIBRARY_URL() {
            return this.getScriptDirectory('instrument/instrument.library.json');
        }

        constructor(config) {
            super();

            if (!config)
                config = {};
            // if(!config.name)
            //     config.name = this0.constructor.name + BufferSourceInstrument.NEW_COUNTER++;
            if (!config.samples)
                config.samples = {};
            this.config = config;            // TODO: validate config

            // if(!SynthesizerInstrument.sampleLoader)
            //     SynthesizerInstrument.sampleLoader = new SampleLoader();
            this.sampleLoader = new SampleLoader(); // SynthesizerInstrument.sampleLoader;
            this.samples = {};
            this.sampleLibrary = null;
            this.instrumentLibrary = null;
            this.libraryHistory = [];
            this.audioContext = null;
            this.loadDefaultSampleLibrary(); // TODO: load samples before audio source loads
            this.loadInstrumentLibrary(this.DEFAULT_INSTRUMENT_LIBRARY_URL);
        }

        connectedCallback() {
            this.loadCSS();
            // this.song = this.closest('music-song'); // Don't rely on this !!!
            this.addEventListener('change', this.onInput);
            this.addEventListener('blur', this.onInput, true);
            this.addEventListener('focus', this.onInput, true);
            // this.addEventListener('input', this.onSubmit);
            this.addEventListener('submit', this.onInput);
            // this.addEventListener('click', this.onInput);

            this.render();
        }

        loadSamples() {
            this.sampleLoader = new SampleLoader(); // SynthesizerInstrument.sampleLoader;
            this.samples = {};
            for (let sampleName in this.config.samples) {
                if (this.config.samples.hasOwnProperty(sampleName)) {
                    this.loadAudioSample(sampleName);
                }
            }
        }


        async init(audioContext) {
            const promises = [];
            this.audioContext = audioContext;
            for (let sampleName in this.samples) {
                if (this.samples.hasOwnProperty(sampleName)) {
                    // noinspection JSIgnoredPromiseFromCall
                    const promise = this.initSample(audioContext, sampleName);
                    promises.push(promise);
                }
            }

            for (let i = 0; i < promises.length; i++) {
                await promises[i];
            }
        }

        // instruments receive audioContext only after user gesture
        async initSample(audioContext, sampleName) {
            const sampleConfig = this.config.samples[sampleName];
            let sampleURL = sampleConfig.url;
            if (!sampleURL)
                throw new Error("Sample config is missing url");

            const sampleData = this.samples[sampleName];


            const ext = sampleURL.substr(-4).split('.').pop().toLowerCase();
            switch (ext) {
                default:
                case 'wav':
                    sampleData.buffer = await this.sampleLoader.initAudioSample(audioContext, sampleURL, this);
                    break;

                case 'json':
                    sampleData.periodicWave = await this.sampleLoader.initAudioSample(audioContext, sampleURL, this);
                    break;
//                 default:
//                     reject("Unknown extension: " + ext);
            }
        }


        async loadAudioSample(sampleName) {
            const sampleConfig = this.config.samples[sampleName];
            let sampleURL = sampleConfig.url;
            if (!sampleURL)
                throw new Error("Sample config is missing url");
            sampleURL = new URL(sampleURL, document.location) + '';

            if (typeof this.samples[sampleName] === "undefined") {
                this.samples[sampleName] = {}
            }

            await this.sampleLoader.loadAudioSampleData(sampleURL, this);
            if(this.audioContext)
                await this.initSample(this.audioContext, sampleName);
        }


        async loadDefaultSampleLibrary() {
            this.loadSamples();

            if (!this.sampleLibrary) {
                await this.loadSampleLibrary(this.config.libraryURL || this.DEFAULT_SAMPLE_LIBRARY_URL);
                this.render();
            }

            // Load first library
            if (this.sampleLibrary.libraries && !this.sampleLibrary.instruments && !this.sampleLibrary.samples) {
                const firstLibrary = this.sampleLibrary.libraries[0];
                firstLibrary.url = new URL(firstLibrary.url, this.sampleLibrary.url) + '';
                if (firstLibrary.url !== this.sampleLibrary.url) {
                    await this.loadSampleLibrary(firstLibrary.url);
                    this.render();
                }

            }

            // Load default sample
            if (this.sampleLibrary.instruments) {
                if (Object.keys(this.config.samples).length === 0) {
                    const sampleInstrument = Object.keys(this.sampleLibrary.instruments)[0];

                    Object.assign(this.config, this.getInstrumentPresetConfig(sampleInstrument));
                    this.loadSamples();

//                 console.info("Loaded default sample instrument: " + sampleInstrument, this.config);
//                 if(this.audioContext)
//                     await this.initSamples(this.audioContext);
                }
            }

            this.render();
        }

        async playSample(destination, sampleName, frequencyValue, startTime, duration, velocity) {
            if (typeof this.samples[sampleName] === 'undefined')
                await this.initSample(destination.context, sampleName)
                // throw new Error("Sample not loaded: " + sampleName);
            const sampleData = this.samples[sampleName];
            const sampleConfig = this.config.samples[sampleName];

            if (!frequencyValue)
                frequencyValue = (this.getCommandFrequency(sampleConfig.keyRoot) || 440);

            let source, sources = [];
            if (sampleData.periodicWave) {
                source = destination.context.createOscillator();   // instantiate an oscillator
                source.frequency.value = frequencyValue;    // set Frequency (hz)

                source.setPeriodicWave(sampleData.periodicWave);
                sources.push(source);
            }

            if (sampleData.buffer) {
                const playbackRate = frequencyValue / (sampleConfig.keyRoot ? this.getCommandFrequency(sampleConfig.keyRoot) : 440);
                source = destination.context.createBufferSource();
                source.buffer = sampleData.buffer;
                source.loop = sampleConfig.loop || false;
                source.playbackRate.value = playbackRate; //  Math.random()*2;
                sources.push(source);
                // source.playbackRate.linearRampToValueAtTime(3.0, startTime + 0.05)
            }

            if (sources.length === 0) {
                console.warn("No sources were created");
                return;
            }

            if (typeof sampleConfig.detune !== "undefined")
                source.detune.value = sampleConfig.detune;


            for (let i = 0; i < sources.length; i++) {
                source = sources[i];
                // songLength = buffer.duration;
                // source.playbackRate.value = playbackControl.value;

                const ADSR = sampleConfig.ADSR || [0, 0, 0, 0.1];

                // Play note
                if (startTime) {
                    source.start(startTime);
                    if (duration) {
                        source.stop(startTime + duration + ADSR[3]);
                    }
                }

                let velocityGain = destination.context.createGain();
                velocityGain.gain.value = parseFloat(velocity || 127) / 127;
                velocityGain.connect(destination);
                destination = velocityGain;

                velocityGain.gain.linearRampToValueAtTime(velocityGain.gain.value, startTime + duration);
                velocityGain.gain.linearRampToValueAtTime(0, startTime + duration + ADSR[3]);

                source.connect(destination);
            }

            // console.log("Buffer Play: ", playbackRate);
            return sources;

        }

        async play(destination, commandFrequency, startTime, duration, velocity) {
            // if(!this.audioContext)
            //     this.init(destination.context);

            // const sources = [];
            if (this.config.samples.hasOwnProperty(commandFrequency)) {
                await this.playSample(destination, commandFrequency, null, startTime, duration, velocity);
                return null;
            }

            let frequencyValue = this.getCommandFrequency(commandFrequency);
            if (Number.isNaN(frequencyValue)) {
                console.warn("Invalid command frequency: ", commandFrequency, this.config);
                return null;
            }

            // Loop through sample
            for (let sampleName in this.config.samples) {
                if (this.config.samples.hasOwnProperty(sampleName)) {
                    const sampleConfig = this.config.samples[sampleName];

                    // Filter sample playback
                    if (sampleConfig.keyAlias)
                        continue;
                    if (sampleConfig.keyLow && this.getCommandFrequency(sampleConfig.keyLow) > frequencyValue)
                        continue;
                    if (sampleConfig.keyHigh && this.getCommandFrequency(sampleConfig.keyHigh) < frequencyValue)
                        continue;

                    // TODO: polyphony

                    this.playSample(destination, sampleName, frequencyValue, startTime, duration, velocity);
                    // this.playBuffer(buffer, destination, frequencyValue, sampleConfig, startTime, duration, velocity);
                    // if (source)
                    //     sources.push(sources);
                }
            }

            // if(sources.length === 0)
            //     console.warn("No samples were played: ", commandFrequency, this.config);
            // return sources;
        }


// Experiment with various ways of applying an envelope.
//     function startTone( mode )
//     {
//         var now = audioContext.currentTime;
//         gainNode.gain.cancelScheduledValues( now );
//
//         // Anchor beginning of ramp at current value.
//         gainNode.gain.setValueAtTime(gainNode.gain.value, now);
//         if( mode == 1 )
//         {
//             // Ramp slowly up with a 1 second duration.
//             gainNode.gain.linearRampToValueAtTime(1.0, now + 1.0);
//         }
//         else if( mode == 2 )
//         {
//             // Ramp up and down.
//             gainNode.gain.linearRampToValueAtTime(1.0, now + 0.5);
//             gainNode.gain.linearRampToValueAtTime(0.0, now + 1.0);
//             gainNode.gain.linearRampToValueAtTime(1.0, now + 1.5);
//             gainNode.gain.linearRampToValueAtTime(0.0, now + 2.0);
//             gainNode.gain.linearRampToValueAtTime(1.0, now + 2.5);
//         }
//         else if( mode == 3 )
//         {
//             // Ramp quickly up.
//             gainNode.gain.linearRampToValueAtTime(1.0, now + 0.1);
//             // Then decay down to a sustain level.
//             gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.3);
//         }
//         else if( mode == 4 )
//         {
//             gainNode.gain.setTargetValueAtTime(1.0, now, 0.2 );
//         }
//     }

        getInstrumentPresetConfig(presetName) {
            const urlPrefix = this.sampleLibrary.urlPrefix || '';
            const newConfig = Object.assign({}, this.config);
            newConfig.preset = presetName;
            newConfig.samples = {};
            if (!this.sampleLibrary.instruments[presetName])
                throw new Error("Invalid Instrument Preset: " + presetName);
            const presetConfig = this.sampleLibrary.instruments[presetName];
            if (!presetConfig.samples)
                presetConfig.samples = {};
            if (Object.keys(presetConfig.samples).length === 0)
                presetConfig.samples[presetName] = {};
            // Object.assign(newConfig, presetConfig);
            Object.keys(presetConfig.samples).forEach((sampleName) => {
                const sampleConfig =
                    Object.assign({
                            url: sampleName
                        },
                        presetConfig.samples[sampleName],
                        this.sampleLibrary.samples[sampleName]);
                sampleConfig.url = new URL(urlPrefix + sampleConfig.url, this.sampleLibrary.url) + '';

                if (typeof sampleConfig.keyRange !== "undefined") {
                    let pair = sampleConfig.keyRange;
                    if (typeof pair === 'string')
                        pair = pair.split(':');
                    sampleConfig.keyLow = pair[0];
                    sampleConfig.keyHigh = pair[1] || pair[0];
                    delete sampleConfig.keyRange;
                }
                newConfig.samples[sampleName] = sampleConfig;
            });

            return newConfig;
        }

        async loadSampleLibrary(url) {
            if (!url)
                throw new Error("Invalid url");
            url = new URL(url, document.location) + '';

            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url + '', true);
                xhr.responseType = 'json';
                xhr.onload = () => {
                    if (xhr.status !== 200)
                        return reject("Sample library not found: " + url);

                    this.sampleLibrary = xhr.response;
                    this.sampleLibrary.url = url + '';

                    if (!this.libraryHistory.find(historyEntry => historyEntry.url === this.sampleLibrary.url))
                        this.libraryHistory.push({
                            url: this.sampleLibrary.url,
                            title: this.libraryHistory.length === 0 ? "Home Index" : this.sampleLibrary.title
                        });
//                 console.log("LIBRARY", this.sampleLibrary);

                    this.render(); // Re-render
                    resolve(this.sampleLibrary);
                };
                xhr.send();
            });
        }

        // Instruments load their own libraries. Libraries may be shared via dispatch
        async loadInstrumentLibrary(url, force = false) {
            if (!url)
                throw new Error("Invalid url");
            url = new URL(url, document.location) + '';
            if (!force && this.instrumentLibrary && this.instrumentLibrary.url === url)
                return this.instrumentLibrary;

            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url + '', true);
                xhr.responseType = 'json';
                xhr.onload = () => {
                    if (xhr.status !== 200)
                        return reject("Sample library not found: " + url);

                    this.instrumentLibrary = xhr.response;
                    this.instrumentLibrary.url = URL + '';
                    this.render();
                    this.dispatchEvent(new CustomEvent('instrument:library', {
                        detail: this.instrumentLibrary,
                        bubbles: true
                    }));
                    resolve(this.instrumentLibrary);
                };
                xhr.send();
            });
        }

        render() {
            const instrumentID = this.getAttribute('data-id') || '0';
            const instrumentIDHTML = (instrumentID < 10 ? "0" : "") + (instrumentID + ":");
            const instrumentPreset = this.config;


            const noteFrequencies = this.noteFrequencies;
            let noteFrequencyOptionsHTML = '';
            for (let i = 1; i <= 6; i++)
                for (let j = 0; j < noteFrequencies.length; j++)
                    noteFrequencyOptionsHTML += `<option>${noteFrequencies[j] + i}</option>`;

            let polyphonyOptionsHTML = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 24, 32, 48, 64, 128, 256, 512]
                .map(polyphonyCount => `<option>${polyphonyCount}</option>`)


                // <form class="instrument-setting change-instrument submit-on-change" data-action="instrument:change">
                //     <input type="hidden" name="instrumentID" value="${instrumentID}"/>
                //     <select name="instrumentURL">
                //         <optgroup label="Change Instrument">
                //             ${this.instrumentLibrary ? this.instrumentLibrary.instruments.map((instrumentConfig) => {
                //                 if (typeof instrumentConfig !== 'object') instrumentConfig = {url: instrumentConfig};
                //                 return `<option value="${instrumentConfig.url}">${instrumentConfig.title || instrumentConfig.url.split('/').pop()}</option>`;
                //             }).join("\n") : ''}
                //         </optgroup>
                //     </select>
                // </form>
            // TODO:
            // const defaultSampleLibraryURL = new URL('/sample/', NAMESPACE) + '';
            this.innerHTML = `
            <div class="instrument-container-header">
                <form class="instrument-setting instrument-name submit-on-change" data-action="instrument:name">
                    <input type="hidden" name="instrumentID" value="${instrumentID}"/>
                    <label class="label-instrument-name">${instrumentIDHTML}<!--
                        --><input name="name" type="text" value="${instrumentPreset.name || ''}" placeholder="Unnamed Instrument"/>
                    </label>
                </form>
                <span style="float: right;">
                    <form class="instrument-setting instrument-setting-preset submit-on-change" data-action="instrument:preset">
                        <input type="hidden" name="instrumentID" value="${instrumentID}"/>
                        <input name="preset" list="presetOptions" value="${this.config.preset}" />
                    </form>
                    <form class="instrument-setting instrument-setting-remove" data-action="instrument:remove">
                        <input type="hidden" name="instrumentID" value="${instrumentID}"/>
                        <button class="remove-instrument">x</button>
                    </form>
                </span>
            </div>
            <table class="instrument-setting-list" style="display: none;">
                <thead>
                    <tr>
                        <th>Polyphony</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <form action="#" class="instrument-setting instrument-setting-polyphony submit-on-change" data-action="instrument:polyphony">
                                <input type="number" name="polyphony" placeholder="Infinite" list="polyphonyOptions" min="0" max="9999" />
                            </form>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table class="sample-setting-list">
                <thead>
                    <tr>
                        <th>Samples</th>
                        <th>Mix</th>
                        <th>Detune</th>
                        <th>Root</th>
                        <th>Alias</th>
                    </tr>
                </thead>
                <tbody>
            ${Object.keys(this.config.samples).map(sampleName => {
                return `
                    <tr>
                        <td>${sampleName}</td>
                        <td>   
                            <form action="#" class="instrument-setting instrument-setting-mixer submit-on-change" data-action="instrument:mixer">
                                <input type="hidden" name="sample" value="${sampleName}" />
                                <input name="mixer" type="range" min="1" max="100" value="${100}" />
                            </form>
                        </td>    
                        <td>   
                            <form action="#" class="instrument-setting instrument-setting-detune submit-on-change" data-action="instrument:detune">
                                <input type="hidden" name="sample" value="${sampleName}" />
                                <input name="detune" type="range" min="-100" max="100" value="${0}" />
                            </form>
                        </td>      
                        <td>   
                            <form action="#" class="instrument-setting instrument-setting-root submit-on-change" data-action="instrument:keyRoot">
                                <input type="hidden" name="sample" value="${sampleName}" />
                                <input name="keyRoot" value="${this.config.samples[sampleName].keyRoot || ''}" list="noteFrequencies" placeholder="N/A" />
                            </form>
                        </td>      
                        <td>   
                            <form action="#" class="instrument-setting instrument-setting-alias submit-on-change" data-action="instrument:keyAlias">
                                <input type="hidden" name="sample" value="${sampleName}" />
                                <input name="keyAlias" value="${this.config.samples[sampleName].keyAlias || ''}" list="noteFrequencies" placeholder="N/A" />
                            </form>
                        </td>  
                    </tr>`;
            }).join("\n")}
                </tbody>
            </table>
            <datalist id="noteFrequencies">
                ${noteFrequencyOptionsHTML}
            </datalist>
            <datalist id="polyphonyOptions">
                ${polyphonyOptionsHTML}
            </datalist>
            <datalist id="presetOptions">
                <option value="">Select Preset</option>
                ${this.sampleLibrary && this.sampleLibrary.libraries ?
                    `<optgroup label="Libraries">` +
                    this.sampleLibrary.libraries.map((libraryConfig) => {
                        if (typeof libraryConfig !== 'object') libraryConfig = {url: libraryConfig};
                        return `<option value="${libraryConfig.url}">${libraryConfig.title || libraryConfig.url.split('/').pop()}</option>`;
                    }).join("\n")
                    + `</optgroup>`
                : null}
                ${this.sampleLibrary && this.sampleLibrary.instruments ?
                    `<optgroup label="${this.sampleLibrary.title || 'Unnamed Library'}">` +
                    Object.keys(this.sampleLibrary.instruments).map((presetName) => {
                        const instrumentConfig = this.sampleLibrary.instruments[presetName];
                        return `<option value="${presetName}" ${presetName === this.config.preset ? ` selected="selected"` : ''}>${presetName || instrumentConfig.title}</option>`;
                    }).join("\n")
                    + `</optgroup>`
                : null}
                ${this.libraryHistory ?
                    `<optgroup label="Other Libraries">` +
                    this.libraryHistory.map((libraryConfig) => {
                        if (typeof libraryConfig !== 'object') libraryConfig = {url: libraryConfig};
                        return `<option value="${libraryConfig.url}">${libraryConfig.title || libraryConfig.url.split('/').pop()}</option>`;
                    }).join("\n")
                    + `</optgroup>`
                : null}
            </datalist>
        `;

        };

        // <td>
        //     <form action="#" class="instrument-setting instrument-setting-range submit-on-change" data-action="instrument:keyRange">
        //         <input type="hidden" name="sample" value="${sampleName}"/>
        //         <input name="keyLow" value="${this.config.samples[sampleName].keyLow || ''}" list="noteFrequencies" placeholder="N/A"> -
        //         <input name="keyHigh" value="${this.config.samples[sampleName].keyHigh || ''}" list="noteFrequencies" placeholder="N/A">
        //     </form>
        // </td>

        onInput(e) {
            if (!this.contains(e.target))
                return;

            // try {
            switch (e.type) {
                case 'submit':
                    this.onSubmit(e);
                    break;
                case 'change':
                // case 'blur':
                    if (e.target.form && e.target.form.classList.contains('submit-on-' + e.type))
                        this.onSubmit(e);
                    break;
                case 'blur':
                    switch(e.target.name) {
                        case 'preset':
                            if(!e.target.value) {
                                e.target.value = this.config.preset;
                            }
                    }
                    break;
                case 'focus':
                    switch(e.target.name) {
                        case 'preset':
                            e.target.value = '';
                    }
                    console.log(e.target, e.type);
                    break;
            }
            // } catch (err) {
            //     this.editor.onError(err);
            // }
        }

        onSubmit(e) {
            if (e.defaultPrevented)
                return;
            e.preventDefault();
            let form = e.target.form || e.target;
            const command = form.getAttribute('data-action');


            switch (command) {
                case 'customURL':
                    const libraryURL = e.target.value;
                    if (libraryURL.endsWith('.library.json')) {
                        console.log("Loading library: " + libraryURL);
                        e.preventDefault();
                        e.stopPropagation();
                        this.loadSampleLibrary(libraryURL);
                        return;
                    }
                    break;
                case 'instrument:preset':
                    const newPreset = form.elements['preset'].value;
                    if (newPreset.endsWith('.json')) {
                        const libraryURL = new URL(newPreset, this.sampleLibrary.url) + '';
                        this.loadSampleLibrary(libraryURL);
                    } else {
                        Object.assign(this.config, this.getInstrumentPresetConfig(newPreset));
                        this.loadSamples();
                    }
                    this.render();

                    break;

                // default:
                //     const newConfig = Object.assign({}, this.config);
                //     for(let i=0; i<form.elements.length; i++)
                //         if(form.elements[i].name)
                //             newConfig[form.elements[i].name] = form.elements[i].value;
                //
                //     // Validate Config
                //     if(newConfig.preset !== this.config.preset) {
                //         Object.assign(newConfig, this.getInstrumentPresetConfig(newConfig.preset));
                //     }
                //
                //     this.config = newConfig;
                //     this.render();
                //     this.dispatchEvent(new CustomEvent('config:updated', {
                //         bubbles:true,
                //         detail: this.config
                //     }))
            }
        }

        // static validateConfig(config, form) {
        //     console.info("Validate: ", config, form);
        // }


        getFrequencyAliases() {
            const aliases = {};
            for (let sampleName in this.config.samples) {
                if (this.config.samples.hasOwnProperty(sampleName)) {
                    const sampleConfig = this.config.samples[sampleName];
                    if (sampleConfig.keyAlias)
                        aliases[sampleConfig.keyAlias] = sampleName;
                }
            }
            return aliases;
        }


        getCommandKeyNumber(command) {
            if (Number(command) === command && command % 1 !== 0)
                return command;
            if (!command)
                return null;

            const instructions = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
            let octave = command.length === 3 ? command.charAt(2) : command.charAt(1),
                keyNumber = instructions.indexOf(command.slice(0, -1));
            if (keyNumber < 3) keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
            else keyNumber = keyNumber + ((octave - 1) * 12) + 1;
            return keyNumber;
        }

        getCommandFrequency(command) {
            const keyNumber = this.getCommandKeyNumber(command);
            return 440 * Math.pow(2, (keyNumber - 49) / 12);
        }

        get noteFrequencies() {
            return ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
        }

        getScriptDirectory(appendPath = '') {
            const scriptElm = document.head.querySelector('script[src$="audio-source-synthesizer.js"],script[src$="audio-source-synthesizer.min.js"]');
            const basePath = scriptElm.src.split('/').slice(0, -2).join('/') + '/';
            return basePath + appendPath;
        }

        loadCSS() {
            if (document.head.querySelector('link[href$="audio-source-synthesizer.css"]'))
                return;
            const linkHRef = this.getScriptDirectory('instrument/audio-source-synthesizer.css');
            // console.log(linkHRef);
            let cssLink = document.createElement("link");
            cssLink.setAttribute("rel", "stylesheet");
            cssLink.setAttribute("type", "text/css");
            cssLink.setAttribute("href", linkHRef);
            document.head.appendChild(cssLink);
        }

    }

    customElements.define('audio-source-synthesizer', SynthesizerInstrument);
    const dispatch = () => {
        document.dispatchEvent(new CustomEvent('instrument:loaded', {
            detail: {
                "class": SynthesizerInstrument,
                "file": "audio-source-synthesizer.js"
            }
        }));
    };
    setTimeout(dispatch, 1);
    setTimeout(dispatch, 500);
    setTimeout(dispatch, 2500); // For slow loaders

    // TODO: memory leak on many sample load
    class SampleLoader {
        constructor() {
            this.samplesByURL = {};
        }

        unloadSamples(instrumentInstance) {

        }

        async loadAudioSampleData(sampleURL) {
            // let sampleURL = sampleConfig.url;
            if (!sampleURL)
                throw new Error("Invalid url");
            sampleURL = new URL(sampleURL, document.location) + '';

            let sampleCache;
            if(typeof this.samplesByURL[sampleURL] !== 'undefined') {
                sampleCache = this.samplesByURL[sampleURL];
                // if(sampleCache.instances.indexOf(instrumentInstance) === -1)
                //     sampleCache.instances.push(instrumentInstance);
                if(sampleCache.loadingPromise)
                    return await sampleCache.loadingPromise;
                return sampleCache.response;
            }

            let resolvePromise = function(){};
            sampleCache = {
                // instances: [instrumentInstance],
                loadingPromise: new Promise((resolve, reject) => {
                    resolvePromise = resolve;
                })
            };
            this.samplesByURL[sampleURL] = sampleCache;

            sampleCache.response = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.open('GET', sampleURL, true);
                const ext = sampleURL.split('.').pop().toLowerCase();
                switch (ext) {
                    default:
                    case 'wav':
                        xhr.responseType = 'arraybuffer';
                        break;
                    case 'json':
                        xhr.responseType = 'json';
                        break;
//                 default:
//                     reject("Unknown extension: " + ext);
                }
                xhr.onload = () => {
                    if (xhr.status !== 200)
                        return reject("Sample file not found: " + sampleURL);
                    resolve(xhr.response);
                };
                xhr.send();
            });

            console.info("Sample Loaded: ", sampleURL);
            resolvePromise(sampleCache.response);

        }

        async initAudioSample(audioContext, sampleURL) {
            sampleURL = new URL(sampleURL, document.location) + '';

            let audioData = await this.loadAudioSampleData(sampleURL);
            const sampleCache = this.samplesByURL[sampleURL];
            if(sampleCache.buffer)
                return sampleCache.buffer;
            if(sampleCache.decodingPromise)
                return await sampleCache.decodingPromise;

            let resolvePromise = function(){};
            sampleCache.decodingPromise = new Promise((resolve, reject) => {
                resolvePromise = resolve;
            });

            console.info("Loading Initiated: ", sampleURL);
            const ext = sampleURL.split('.').pop().toLowerCase();
            switch (ext) {
                default:
                case 'wav':
                    // sampleCache.buffer = await audioContext.decodeAudioData(audioData);
                    sampleCache.buffer = await new Promise((resolve, reject) => {
                        audioContext.decodeAudioData(audioData, // Safari does not support await for decodeAudioData
                            (buffer) => {
                                resolve(buffer);
                            },

                            (e) => {
                                reject("Error with decoding audio data" + e.error);
                            }
                        );
                    });
                    break;

                case 'json':
                    if (!audioData.real || !audioData.imag)
                        return reject("Invalid JSON for periodic wave");

                    sampleCache.buffer = context.createPeriodicWave(
                        new Float32Array(audioData.real),
                        new Float32Array(audioData.imag)
                    );
                    break;
//                 default:
//                     reject("Unknown extension: " + ext);
            }

            console.info("Sample Initiated: ", sampleURL);
            resolvePromise(sampleCache.buffer);
            return sampleCache.buffer;
        }
    }
}