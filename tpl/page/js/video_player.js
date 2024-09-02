/*global tstring, page_globals, __WEB_TEMPLATE_WEB__, Promise, BackgroundColorTheif, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";



function video_player() {

    // vars
    // mode
    this.mode

    // title
    this.title

    // video_url
    this.video_url

    // posterframe_url
    this.posterframe_url



    /**
    * INIT
    */
    this.init = function (options) {

        const self = this

        // fix vars
        this.mode = options.mode || "default"
        this.video_url = options.video_url
        this.posterframe_url = options.posterframe_url
        this.title = options.title

        // status
        self.status = "initied"


        return true
    }//end init



    /**
    * RENDER
    */
    this.render = function (options) {

        const self = this

        return new Promise(function (resolve) {

            const fragment = new DocumentFragment()

            // watermark
            // const watermark = common.create_dom_element({
            // 	element_type 	: "div",
            // 	class_name 		: "watermark"
            // })
            // fragment.appendChild(watermark)

            // video. Build player
            const video = self.build_video_html5({
                type: ["video/mp4"], // video type. (array) default ["video/mp4"]
                id: "video_player", // id. dom element video id (string) default "video_player"
                controls: true, // controls. video control property (boolean) default true
                play: false, // play (boolean). play video on ready. default false
                class: "video_player", // class css. video aditional css classes // "video-js video_hidden"
                preload: "auto", // preload (string) video element attribute preload
                width: null, // width (integer) video element attribute. default null
                height: null // height (integer) video element attribute. default null
            })
            fragment.appendChild(video)
            self.video = video // fix

            // footer_info
            // const footer_info = self.build_footer_info({
            // 	term_text				: term_text,
            // 	terms					: terms,
            // 	av_section_id			: av_section_id,
            // 	interview_section_id	: interview_section_id,
            // 	mode					: mode
            // })
            // fragment.appendChild(footer_info)

            // filmstrip
            // const filmstrip = self.build_filmstrip_indexations({
            // 	posterframe_url	: posterframe_url
            // 	// term			: self.term
            // })
            // fragment.appendChild(filmstrip)

            const wrapper = common.create_dom_element({
                element_type: "div",
                class_name: "wrapper_video_player"
            })
            wrapper.appendChild(fragment)

            resolve(wrapper)
        })
    }//end render



    /**
    * BUILD_TOP_INFO
    */
    this.build_top_info = (options) => {
        if (SHOW_DEBUG === true) {
            console.log("[ui.build_top_info] options:", options)
        }

        const self = this

        const date = options.date
        const code = options.code || ''
        const av_section_id = options.av_section_id

        // top_info
        const top_info = common.create_dom_element({
            element_type: "div",
            class_name: "top_info"
        })

        // fecha
        if (date && date.length > 0) {
            const fecha_text = tstring["dating"] + ": " + (common.timestamp_to_fecha(date) || '')
            common.create_dom_element({
                element_type: "span",
                class_name: "fecha",
                text_content: fecha_text,
                parent: top_info
            })
        }

        // codigo
        if (code && code.length > 0) {
            const codigo_text = tstring["codigo"] + ": " + code
            common.create_dom_element({
                element_type: "span",
                class_name: "codigo",
                text_content: codigo_text,
                parent: top_info
            })
        }

        // cinta
        const tape_text = "[" + tstring["cinta"] + " " + av_section_id + "]"
        const tape = common.create_dom_element({
            element_type: "span",
            class_name: "cinta",
            text_content: tape_text,
            parent: top_info
        })

        // subscribe selected_key_change event
        event_manager.subscribe('selected_key_change', update_data)
        function update_data() {
            // tape number text update
            tape.innerHTML = "[" + tstring["cinta"] + " " + self.data_video_items[self.selected_key].section_id + "]"
        }


        return top_info
    }//end build_top_info



    /**
    * BUILD_BODY_INFO
    */
    this.build_body_info = (options) => {
        if (SHOW_DEBUG === true) {
            console.log("[ui.build_body_info] options:", options)
        }

        const self = this

        const abstract = options.abstract
        const terms = options.terms
        const mode = options.mode

        // body_info . container
        const body_info = common.create_dom_element({
            element_type: "div",
            class_name: "body_info hide"
        })

        // transcription.
        const transcription_container = common.create_dom_element({
            element_type: "div",
            id: "transcription_container",
            class_name: "transcription_text text_inside overlay_text hide",
            inner_html: self.data_video_items[self.selected_key].transcription,
            parent: body_info
        })

        // abstract_text. Build abstract text and insert into video_container div
        common.create_dom_element({
            element_type: "div",
            id: "abstract_container",
            class_name: "abstract_text text_inside overlay_text hide",
            inner_html: abstract,
            parent: body_info
        })

        // terms
        // if ((terms && Object.keys(terms).length>0) && (mode==="load_video_interview" || mode==="load_video_search_free")) {
        // 		console.log("terms:",terms);

        // 	const terms_element = common.create_dom_element({
        // 		element_type : "div",
        // 		id 			 : "terms_container",
        // 		class_name   : "terms text_inside overlay_text hide",
        // 		parent 		 : body_info
        // 	})
        // 	common.create_dom_element({
        // 			element_type : "h2",
        // 			class_name   : "",
        // 			text_content : tstring["temas_relacionados"] || "Temas relacionados",
        // 			parent 		 : terms_element
        // 		})
        // 	const terms_list = common.create_dom_element({
        // 		element_type : "ul",
        // 		class_name   : "terms_list",
        // 		parent 		 : terms_element
        // 	})
        // 	for (let key in terms) {
        // 		common.create_dom_element({
        // 			element_type : "li",
        // 			text_content : terms[key],
        // 			parent 		 : terms_list
        // 		})
        // 		.addEventListener("click",function(e){
        // 			const url = BASE_LINKS + "search_thematic/?q=" + this.textContent
        // 			const win = window.open(url, '_blank');
        // 			win.focus();
        // 		})
        // 	}
        // }

        // share form
        // const ar_path 	= window.location.pathname.split("/")
        // const ar_path_full = []
        // for (var i = 1; i < (ar_path.length-1); i++) {
        // 	ar_path_full.push(ar_path[i])
        // }
        // const url = window.location.origin + "/" + ar_path_full.join("/") + "/video_view/?" + tpl_common.load_video_options

        // const share_form = common.create_dom_element({
        // 		element_type : "form",
        // 		id   		 : "share_form",
        // 		class_name   : "share_form overlay_text hide",
        // 		attributes 	 : {
        // 			action : "javascript:void(0);"
        // 		},
        // 		parent 		 : body_info
        // 	})
        // 	share_form.addEventListener("submit", function(){
        // 		send_form(this)
        // 	},false)
        // // email
        // 	const label_email = common.create_dom_element({
        // 			element_type : "label",
        // 			text_content : tstring.email_destino || "Email de destino",
        // 			parent 		 : share_form
        // 		})
        // 		common.create_dom_element({
        // 			element_type : "input",
        // 			type 		 : "text",
        // 			id   		 : "target_email",
        // 			parent 		 : label_email
        // 		})
        // // url
        // 	const label_url = common.create_dom_element({
        // 			element_type : "label",
        // 			text_content : tstring.url || "URL",
        // 			parent 		 : share_form
        // 		})
        // 		common.create_dom_element({
        // 			element_type : "input",
        // 			type 		 : "text",
        // 			id   		 : "video_url",
        // 			value 		 : url,
        // 			parent 		 : label_url
        // 		}).addEventListener("click", function(){
        // 			this.select()
        // 		},false)
        // // iframe
        // 	const iframe_code  = "<iframe src=\"" + url + "\" frameborder=\"0\" width=\"766\" height=\"620\"></iframe>"
        // 	const label_iframe = common.create_dom_element({
        // 			element_type : "label",
        // 			text_content : tstring.iframe || "Iframe",
        // 			parent 		 : share_form
        // 		})
        // 		common.create_dom_element({
        // 			element_type : "input",
        // 			type 			 : "text",
        // 			id   			 : "iframe",
        // 			value 		 : iframe_code,
        // 			parent 		 : label_iframe
        // 		}).addEventListener("click", function(){
        // 			this.select()
        // 		},false)
        // // msg
        // 	const label_mensaje = common.create_dom_element({
        // 			element_type : "label",
        // 			text_content : tstring.mensaje || "Mensaje",
        // 			parent 		 : share_form
        // 		})
        // 		common.create_dom_element({
        // 			element_type : "textarea",
        // 			id   			 : "msg",
        // 			parent 		 : label_mensaje
        // 		})
        // // submit button
        // 	const submit_wrap = common.create_dom_element({
        // 			element_type : "div",
        // 			class_name   : "submit_wrap",
        // 			parent 		 : share_form
        // 		})
        // 		common.create_dom_element({
        // 			element_type : "input",
        // 			type 		 : "submit",
        // 			value 		 : tstring.enviar || "Enviar",
        // 			class_name   : "submit",
        // 			parent 		 : submit_wrap
        // 		})

        // subscribe selected_key_change event
        event_manager.subscribe('selected_key_change', update_data)
        function update_data() {
            // transcription text update
            transcription_container.innerHTML = self.data_video_items[self.selected_key].transcription
        }

        return body_info
    }//end build_body_info



    /**
    * BUILD_FOOTER_INFO
    */
    this.build_footer_info = (options) => {

        const self = this

        // vars
        const mode = options.mode
        const term_text = options.term_text
        const terms = options.terms
        const av_section_id = options.av_section_id
        const interview_section_id = options.interview_section_id

        // footer_info . container
        const footer_info = common.create_dom_element({
            element_type: "div",
            class_name: "footer_info"
        })

        // term text
        if (term_text) common.create_dom_element({
            element_type: "div",
            class_name: "term_text",
            text_content: term_text,
            parent: footer_info
        })

        // Button download subtitles
        // if (dedalo_logged===true) { // defined in page vars
        // 	common.create_dom_element({
        // 		element_type : "input",
        // 		type 		 : 'button',
        // 		class_name   : "button_subtitles",
        // 		value 		 : tstring["descargar_subtitulos"] || "Descarga subtítulos",
        // 		dataset 	 : {
        // 			target : "transcription_container"
        // 		},
        // 		parent 		 : footer_info
        // 	}).addEventListener("click", function(e){
        // 		var link = document.createElement('a')
        // 			link.href = tpl_common.subtitles_url
        // 			link.download = 'subtitles.vtt';
        // 			link.click()
        // 		console.log("tpl_common.subtitles_url:",tpl_common.subtitles_url);
        // 	},false)
        // }

        // Button download video
        //common.create_dom_element({
        //	element_type : "div",
        //	class_name   : "button_download_video",
        //	text_content : "Descarga vídeo",
        //	dataset 	 : {
        //		target : "transcription_container"
        //	},
        //	parent 		 : footer_info
        //})
        //.addEventListener("click", function(e){
        //
        //	var link = document.createElement('a')
        //		link.href = tpl_common.subtitles_url
        //		link.download = 'video.mp4';
        //		link.click()
        //
        //	console.log("tpl_common.video_url:",tpl_common.video_url);
        //},false)

        // Button share
        // common.create_dom_element({
        // 	element_type : "input",
        // 	type 		 : 'button',
        // 	value 		 : tstring["compartir"] || "Compartir",
        // 	class_name   : "button_share",
        // 	dataset 	 : {
        // 		target : "share_form"
        // 	},
        // 	parent 		 : footer_info
        // }).addEventListener("click", function(e){
        // 	const target 	  = document.getElementById(this.dataset.target)
        // 	const ar_to_hide = document.querySelectorAll(".overlay_text")
        // 	tpl_common.toggle_element(this, target, ar_to_hide)
        // },false)

        // Button full interview
        let new_data_video = [] // data_video. When full_interview is called, new data_video value is assigned

        // button. If mode is 'interview' doesn't render full interview button
        if (mode !== "interview") {
            const button_full_interview = common.create_dom_element({
                element_type: "input",
                type: 'button',
                class_name: "button_full_interview",
                value: tstring["completa"] || "Ver completa",
                parent: footer_info
            })
            button_full_interview.dd_target = 'full' // full | back
            const prev_data_video_items = self.data_video_items.map(function (el) { return el })

            button_full_interview.addEventListener("click", function (e) {

                if (button_full_interview.dd_target === 'back') {
                    // replace data_video_items value
                    self.data_video_items = prev_data_video_items

                    button_full_interview.value = tstring["completa"] || "Ver completa"

                    button_full_interview.dd_target = 'full'

                } else {
                    // replace data_video_items value
                    self.data_video_items = new_data_video

                    button_full_interview.value = tstring["volver"] || "Volver"

                    button_full_interview.dd_target = 'back'
                }

                // selected key
                self.selected_key = 0

                // notification the changes
                // event publish
                event_manager.publish('data_video_items_change', self.data_video_items)
                event_manager.publish('selected_key_change', self.selected_key)
            })
        }

        // get interview data
        data_manager.request({
            body: {
                dedalo_get: 'full_interview',
                section_id: interview_section_id
            }
        })
            .then(function (response) {

                // new data_video. parse data
                new_data_video = [] // reset content
                for (let i = 0; i < response.result.length; i++) {

                    const reel = response.result[i]
                    const reel_fragment = reel.fragments[0]

                    const subtitles_url = reel_fragment.subtitles_url
                    const video_url = common.get_media_engine_url(reel_fragment.video_url.split("/").pop(), 'av', null, true)
                    const transcription = reel_fragment.fragm

                    new_data_video.push({
                        section_id: reel.av_section_id,
                        subtitles_url: subtitles_url,
                        tcin_secs: null,
                        tcout_secs: null,
                        transcription: transcription,
                        type: "fragment",
                        video_url: video_url
                    })
                }
            })

        // Button terms
        // if ((terms && Object.keys(terms).length>0) && (mode==="load_video_interview" || mode==="load_video_search_free")) {
        // 	common.create_dom_element({
        // 		element_type : "input",
        // 		type 		 : 'button',
        // 		class_name   : "button_terms",
        // 		value 		 : tstring["descriptores"] || "Descriptores",
        // 		dataset 	 : {
        // 			target : "terms_container"
        // 		},
        // 		parent 		 : footer_info
        // 	}).addEventListener("click", function(e){
        // 		const target 	 = document.getElementById(this.dataset.target)
        // 		const ar_to_hide = document.querySelectorAll(".overlay_text")
        // 		tpl_common.toggle_element(this, target, ar_to_hide)
        // 	},false)
        // }

        // Button abstract
        const abstract = self.data_video_items[self.selected_key].abstract
        if (abstract && abstract.length > 0) {
            common.create_dom_element({
                element_type: "input",
                type: 'button',
                class_name: "button_abstract",
                value: tstring["abstract"] || "Abstract",
                parent: footer_info
            }).addEventListener("click", function (e) {
                toggle_element('abstract_container')
            }, false)
        }

        // Button transcription
        common.create_dom_element({
            element_type: "input",
            type: 'button',
            class_name: "button_transcription",
            value: tstring["transcripcion"] || "Transcripción",
            parent: footer_info
        }).addEventListener("click", function (e) {
            toggle_element('transcription_container')
        }, false)

        // toggle_element function
        function toggle_element(id) {
            // reset
            const active = self.body_info.querySelector('.active')
            if (active) {
                active.classList.remove('active')
                active.classList.add('hide')
                if (active.id === id) {
                    self.video.classList.remove('hide')
                    active.parentNode.classList.add('hide')
                    return
                }
            }

            self.video.classList.add('hide')

            // active
            const current_element = document.getElementById(id)
            current_element.classList.add('active')
            current_element.classList.remove('hide')
            current_element.parentNode.classList.remove('hide')
        }


        return footer_info
    }//end build_footer_info



    /**
    * BUILD_FILMSTRIP_INDEXATIONS
    * Used by full interview mode and search thematic mode
    */
    this.build_filmstrip_indexations = (options) => {

        const self = this

        const posterframe_url = options.posterframe_url
        const video_items = self.data_video_items
        const key = self.selected_key

        // filmstrip . container
        const filmstrip = common.create_dom_element({
            element_type: "div",
            class_name: "filmstrip"
        })

        // list
        const build_list = function (video_items, key, filmstrip) {

            if (!video_items || video_items.length < 2) {
                filmstrip.classList.add('hide')
                return false
            } else {
                if (filmstrip.classList.contains('hide')) {
                    filmstrip.classList.remove('hide')
                }
            }

            const content = common.create_dom_element({
                element_type: "div",
                class_name: "content",
                parent: filmstrip
            })



            for (let i = 0; i < video_items.length; i++) {

                const item = video_items[i]

                // link
                const selected = (i == key) ? " selected" : "";
                const link = common.create_dom_element({
                    element_type: "a",
                    class_name: selected,
                    parent: content
                })
                link.addEventListener("mouseup", function (e) {
                    e.stopPropagation()

                    if (selected === "selected") {
                        return false
                    }
                    content.querySelector('.selected').classList.remove('selected')
                    this.classList.add('selected')

                    // fix
                    self.selected_key = i

                    // event publish map_selected_marker
                    event_manager.publish('selected_key_change', self.selected_key)
                })

                // posterframe image
                const posterframe = common.create_dom_element({
                    element_type: "img",
                    class_name: "posterframe",
                    src: posterframe_url,
                    parent: link
                })
            }

            return true
        }
        build_list(video_items, key, filmstrip)

        // subscribe selected_key_change event
        event_manager.subscribe('data_video_items_change', update_video)
        function update_video() {

            // clean nodes
            while (filmstrip.hasChildNodes()) {
                filmstrip.removeChild(filmstrip.firstChild);
            }
            // rebuild list
            build_list(self.data_video_items, self.selected_key, filmstrip)
        }


        return filmstrip
    }//end build_filmstrip_indexations



    /**
    * BUILD_VIDEO_HTML5
    * @return dom element vide
    */
    this.build_video_html5 = function (request_options) {

        const self = this

        // options
        const options = {
            type: ["video/mp4"], // video type. (array) default ["video/mp4"]
            id: "video_html5", // id. DOM element video id (string) default "video_html5"
            controls: true, // controls. video control property (boolean) default true
            play: false, // play (boolean). play video on ready. default false
            // src						: [""], // video src. (array)
            // poster					: "", // poster image. (string) url of posterframe image
            class: "", // class css. video additional css classes
            preload: "auto", // preload (string) video element attribute preload
            height: null, // height (integer) video element attribute. default null
            width: null, // width (integer) video element attribute. default null
            // tcin_secs				: 0, // tcin_secs (integer). default null
            // tcout_secs				: null, // tcout_secs (integer). default null
            // ar_subtitles				: null, // ar_subtitles (array). array of objects with subtitles full info. default null
            // ar_restricted_fragments	: null // ar_restricted_fragments. (array) default null
        }

        // apply options
        for (var key in request_options) {
            if (request_options.hasOwnProperty(key)) {
                options[key] = request_options[key]
            }
        }

        const posterframe_url = self.posterframe_url
        const video_url = self.video_url

        // video handler events
        const handler_events = {
            loadedmetadata: {},
            timeupdate: {},
            contextmenu: {}
        }

        // html5 video. DOM element html5 video
        const video = document.createElement("video")
        video.id = options.id
        video.controls = options.controls
        video.poster = posterframe_url
        video.className = options.class
        video.preload = options.preload
        video.controlsList = "nodownload"
        video.dataset.setup = '{}'

        if (options.height) {
            video.height = options.height
        }
        if (options.width) {
            video.width = options.width
        }
        options.play = true
        if (options.play && options.play === true) {
            handler_events.loadedmetadata.play = (e) => {
                try {
                    video.play()
                } catch (error) {
                    console.warn("Error on video play:", error);
                }
            }
        }

        // src. video source
        // const source	= document.createElement("source")
        // 	  source.src	= item.video_url
        // 	  source.type	= 'video/mp4'
        // video.appendChild(source)
        video.src = video_url

        // restricted fragments. Set ar_restricted_fragments on build player to activate skip restricted fragments
        // if (options.ar_restricted_fragments) {
        // 	const ar_restricted_fragments = options.ar_restricted_fragments
        // 	const tcin_secs				  = options.tcin_secs
        // 	if (typeof ar_restricted_fragments!=="undefined" && ar_restricted_fragments.length>0) {
        // 		handler_events.timeupdate.skip_restricted = () => {
        // 			self.skip_restricted(video, ar_restricted_fragments, tcin_secs)
        // 		}
        // 	}
        // }

        // subtitles
        // const set_subtitles = function(){

        // 	// clean
        // 		const current_subtitles_tracks = video.querySelectorAll('track')
        // 		if (current_subtitles_tracks) {
        // 			for (let i = 0; i < current_subtitles_tracks.length; i++) {
        // 				current_subtitles_tracks[i].remove()
        // 			}
        // 		}

        // 	// subtitles_url
        // 		// temporal absolute url
        // 		const subtitles_url = page_globals.__WEB_BASE_URL__ + item.subtitles_url + "&db_name=" + page_globals.WEB_DB

        // 	// ar_subtitles
        // 		const ar_subtitles = [{
        // 			src		: subtitles_url,
        // 			srclang	: page_globals.WEB_CURRENT_LANG_CODE_ISO2,
        // 			label	: tstring[page_globals.WEB_CURRENT_LANG_CODE_ISO2] || 'Español',
        // 			default	: true
        // 		}]

        // 	// subtitles_tracks
        // 		for (let i = 0; i < ar_subtitles.length; i++) {

        // 			const subtitle_obj = ar_subtitles[i]
        // 			if (subtitle_obj.src===undefined) {
        // 				console.warn("Invalid subtitle object:",subtitle_obj);
        // 				continue
        // 			}

        // 			// Build track
        // 			const track		= document.createElement("track")
        // 			track.kind		= "captions" // subtitles | captions
        // 			track.src		= subtitle_obj.src
        // 			track.srclang	= subtitle_obj.srclang
        // 			track.label		= subtitle_obj.label
        // 			if (subtitle_obj.default && subtitle_obj.default===true) {
        // 				track.default = true
        // 				track.addEventListener("load", function() {
        // 				   this.mode = "showing";
        // 				   video.textTracks[0].mode = "showing"; // thanks Firefox
        // 				});
        // 			}

        // 			// add to video
        // 			video.appendChild(track)

        // 		}//end for (var i = 0; i < ar_subtitles.length; i++)

        // 	return true
        // }//end set_subtitle

        // handler_events.loadedmetadata.add_subtitles_tracks = () => {
        // 	set_subtitles()
        // }

        // hide subtitles info
        // const subtitles_info = document.getElementById("subtitles_info")
        // if (subtitles_info) {
        // 	video.addEventListener("play", function(){
        // 		subtitles_info.remove();
        // 	})
        // }

        // msj no html5
        const msg_no_js = document.createElement("p")
        msg_no_js.className = "vjs-no-js"
        const msj_text = document.createTextNode("To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video")
        msg_no_js.appendChild(msj_text)
        video.appendChild(msg_no_js)

        // disable_context_menu
        // handler_events.contextmenu.disable_context_menu = (e) => {
        // 	e.preventDefault();
        // }

        // video events	register
        common.register_events(video, handler_events)

        // subscribe selected_key_change event
        // event_manager.subscribe('selected_key_change', update_video)
        // function update_video() {
        // 	video.pause()
        // 	// update item object
        // 	item		= self.data_video_items[self.selected_key]
        // 	// video src update
        // 	video.src	= item.video_url // when src change, subtitles are automatically updated on metadata load
        // }


        return video
    }//end build_video_html5



}//end video_player
