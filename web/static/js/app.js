import "phoenix_html"
import m from "mithril"
import {Socket} from "phoenix"
import alertify from "alertify.js"

document.addEventListener("DOMContentLoaded", function(event) {
  if (document.getElementById("close-alert") != null) { document.getElementById("close-alert").addEventListener("click",function(e){
    document.getElementById("close-alert").parentNode.style.display = "none";
  })};
  })

let jwt = document.querySelector('meta[name="guardian_token"]').getAttribute("content")
let socket = new Socket("/socket", {params: {guardian_token: jwt}})

if (document.getElementById("main")) {
  socket.connect()
}

socket.onOpen( () => {
  console.log("Connected!")
})
socket.onError( () => {
  console.log("there was an error with the connection!")
})
socket.onClose( () => {
  console.log("the connection dropped")
})

let username = document.querySelector('meta[name="guardian_token"]').getAttribute("username")
console.log(username)

function showLog(message, position) {
  alertify.delay(5000).logPosition(position).log(message)
}

function showError(message, position) {
  alertify.delay(5000).logPosition(position).error(message)
}

function showSuccess(message, position) {
  alertify.delay(5000).logPosition(position).success(message)
}

function scrolledToBottom(element, isInit, context) {
  element.scrollTop = element.scrollHeight
}

function convertTimestamp(element, isInit, context) {
  if (!isInit) {
    let timestamp = element.getAttribute("datetime")
    var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
      yyyy = d.getFullYear(),
      mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
      dd = ('0' + d.getDate()).slice(-2),     // Add leading 0.
      hh = d.getHours(),
      h = hh,
      min = ('0' + d.getMinutes()).slice(-2),   // Add leading 0.
      ampm = 'AM',
      time;
        
    if (hh > 12) {
      h = hh - 12;
      ampm = 'PM';
    } else if (hh === 12) {
      h = 12;
      ampm = 'PM';
    } else if (hh == 0) {
      h = 12;
    }
    
    // ie: 2013-02-18, 8:35 AM  
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
      
    element.innerHTML = time

  }
}

let App = {
  vm: {
    chatname: m.prop("..."),
    public: m.prop(""),
    one_talk(name, id, moder){
      if (App.vm.chatname() != name && socket.connectionState() == "open" ) {
        App.vm.active_talk(name)
        Chat.vm.main_tab(id, moder)
      } else if (socket.connectionState() != "open") {
        showError("Service unavailable", "top right")
      } else {
        showLog(`Already joined to ${name}   (>‿◠)✌`, "top right" )
      }
    },
    loadTalks(){
      if (App.vm.public() === "" && socket.connectionState() == "open") {
        AllTalks.vm.load()
        App.vm.public("selected")
      } else if (socket.connectionState() != "open") {
        showError("Service unavailable", "top right")
      } else {
        showLog("Already loaded all talks", "top right")
      }
    },
    
    active_talk(name){
      App.vm.chatname(name)
    },
   
  },
  controller(){ this.vm = App.vm; },
  
  view(ctrl){
    return m("div", {class: "o-grid"}, [
      m("div", {class: "chat-column o-grid__col o-grid__col--2-of-12"},
        m("div", {class: "chat-card c-card c-card--floating is-selected"}, [
          m("a", {onclick: ctrl.vm.loadTalks.bind(ctrl.vm)}, "Talks"),
          m.component(AllTalks, {})
        ]
        )
      ),
      m("div", {class: "chat-column o-grid__col o-grid__col--8-of-12"},
        m.component(Chat, {})
      ),
      m("div", {class: "chat-column o-grid__col o-grid__col--2-of-12"},
        m("div", {class: "chat-card c-card c-card--floating is-selected"},
          m("h3", "Online Users")
        )
      ),
    ])
  }
}

let AllTalks = {
  vm: {
    channel: false,
    errorMsg: "",
    data: m.prop(false),
    btn_shown: m.prop(true),
    load_talk_chat(member){
      App.vm.one_talk(member.name, member.id, member.moder_id)
    },
    load_form(){
      AllTalks.vm.btn_shown(false)
    },
    form_disappear() {
      AllTalks.vm.btn_shown(true)
    },
    
    send_talk(new_talk){
      if (new_talk != "") {
        console.log(new_talk)
        AllTalks.vm.channel.push("push_talk", new_talk) 
        AllTalks.vm.btn_shown(true)
      } else {
        showError("Fill in input", "top left")
      }
    },
    success(mydata){
      AllTalks.vm.data(mydata)
      AllTalks.vm.errorMsg = ""
      m.redraw()
    },
    fail(errorStatus){ 
      AllTalks.vm.errorMsg = "Server responded with a "+errorStatus+" error status."
      m.redraw()
    },

    load(){
      if (AllTalks.vm.channel) {
        AllTalks.vm.channel.leave().receive("ok", (resp) => {
          console.log("Talks reload started")
          AllTalks.vm.data(false)
        });
      }

      AllTalks.vm.channel = socket.channel("talks:lobby")

      AllTalks.vm.channel.on("talks_loaded", payload => {
        console.log("got talks", payload.talks);
        AllTalks.vm.success(payload.talks);
      })
    
      AllTalks.vm.channel.on("talk_added", payload => {
        console.log(payload);
        AllTalks.vm.data().unshift(payload);
        showSuccess(`${payload.name} added`, "top left")
        m.redraw();
      })

      AllTalks.vm.channel.on("add_talk_error", payload => {
        showError(payload.error, "top left");
      })

      AllTalks.vm.channel.on("leave_lobby", payload => {
        console.log("User leaving");
      })

      AllTalks.vm.channel.join()
        .receive("ok", resp => { console.log(`Talks loaded`) })
        .receive("error", resp => { console.log(`Unable to load talks`, resp); AllTalks.vm.fail("404");})

    },
  },
  controller(){ this.vm = AllTalks.vm; m.redraw.strategy("diff") },
  view(ctrl) {
    return m("div", {class: "talks-actions"}, [
            !ctrl.vm.data() || ctrl.vm.errorMsg ?
              m("h4", " Click button above to load talks" )
             :

            m("ul", {class: "talks_list"}, [

              ctrl.vm.data().length > 0 ?
              ctrl.vm.data().map((member) => {
                return m("li", {id: `${member.id}`},
                
                m("h4", [
                  
                  m("span", {class: "talk-icon typcn typcn-messages"}),
                  m("span", {class: "talk_name pointer", onclick: ctrl.vm.load_talk_chat.bind(ctrl.vm, member)}, member.name),

                  App.vm.chatname() != member.name ? "" :
                  m("span", {class: "typcn typcn-media-play u-l-fr"})
                ])
              );
              }) :
              m("li", [
                m("h5", "No talks yet!")
              ])
            ]),

            !ctrl.vm.errorMsg ? "" : 

            m("div", {class: "container"},[
              m("p", ctrl.vm.errorMsg),
              m("p", "Check your internet connection and"),
              m("button", {class: "c-btn c-btn--primary"}, "Reload"),
            ]),

            !ctrl.vm.data() ? "" :
            ctrl.vm.btn_shown() ?
            m("div", {class: "add-button"},
              m("button", {onclick: ctrl.vm.load_form.bind(ctrl.vm), class: `c-btn c-btn--primary`}, "Add talk")
            ) :
            m.component(TalkForm)

          ])
  }
}

let TalkForm = {
  vm: {
    new_talk: m.prop(""),
    submit(){
      if (socket.connectionState() == "open"){
        AllTalks.vm.send_talk(TalkForm.vm.new_talk())
        TalkForm.vm.new_talk("")
      } else {
        showError("Service unavailable", "top right")
        TalkForm.vm.new_talk("")
      }
    },
    close(){
      AllTalks.vm.form_disappear()
      TalkForm.vm.new_talk("")
    }
  },
  controller(){ this.vm = TalkForm.vm; m.redraw.strategy("diff")},
  view(ctrl) {
    return m("div", {class: "add-talk-group"},
              m("input", {placeholder:"Add talk", value: ctrl.vm.new_talk(), onchange: m.withAttr("value", ctrl.vm.new_talk), class: "c-input", type:"text", id:"add_talk"}),
              m("div", {class: "c-btn-group"}, [

                m("button", {onclick: ctrl.vm.close.bind(ctrl.vm), class: "c-btn c-btn--tertiary"}, "Close"),
                m("button", {onclick: ctrl.vm.submit.bind(ctrl.vm), class: "c-btn c-btn--primary"}, "Submit")
              ])
            )
  }
}

let Chat = {
  vm: {
    channel: false,
    messages: m.prop([]),
    talk_id: m.prop(0),
    moderator: m.prop(0),
    reset_props(){
      if (Chat.vm.channel) {
        Chat.vm.channel.leave().receive("ok", (resp) => {
          console.log(`${username} left`)
        })
      }
      Chat.vm.messages([])
      Chat.vm.main_selected("selected")
    },
    sendNewMessage(msg) {
      let date = new Date()
      let at = (date.getTime() / 1000) >> 0
      Chat.vm.channel.push("new_msg", {body: msg, at: at})
    },
    main_tab(id, moder){
      if (socket.connectionState() != "open") {
        showError("Service unavailable", "top right")
      } else {
        if (Chat.vm.channel) {
          Chat.vm.channel.leave().receive("ok", (resp) => {
            console.log(`${username} left`)
            Chat.vm.messages([])
          })
        }
        Chat.vm.talk_id(id)
        Chat.vm.moderator(moder)
        
        Chat.vm.channel = socket.channel("rooms:" + id, {})

        Chat.vm.channel.on("new_msg", payload => {
          Chat.vm.messages().push(payload)
          m.redraw()
        })

        Chat.vm.channel.on("user:joined", payload => {
          showLog(`${payload.new_user} joined`, "bottom right")
        })

        Chat.vm.channel.on("im_joined", payload => {
          Chat.vm.messages(payload.messages)
          m.redraw()
        })

        Chat.vm.channel.on("user_left", payload => {
          console.log(payload)
          showLog(`${payload.user} left`, "bottom right")
          m.redraw()
        });
    
        Chat.vm.channel.join()
          .receive("ok", resp => { console.log("Joined successfully", resp) })
          .receive("error", resp => { console.log("Unable to join", resp) })
      }
    }
  }, 
  controller(){ this.vm = Chat.vm; m.redraw.strategy("diff") },
  view(ctrl) {
    return  m("div", {class: "chat-card c-card c-card--floating is-selected"}, [
              App.vm.chatname() == "..." ? m("div", {class: "c-loader"}, "Loading...") : m("h4", App.vm.chatname()),

              m("div", {class: "messages-block"}, [
                App.vm.chatname() == "..." ? m("h3", `Hello ${username}`) : [
                  m.component(Messages, {}),
                  m.component(MessageInput, {})
                ]
              ])
            ])    
  }
}

let Messages = {
  vm: {},
  controller(){ this.vm = Messages.vm; }, 
  view(ctrl) {
    return  m("ul", {class: "messages-list", config: scrolledToBottom}, Chat.vm.messages().length === 0 ? 
              m("li", {class: "messages-list-item"}, "No messages yet...") :
              Chat.vm.messages().map((message) => {
              return m("li", {class: "messages-list-item"},  
                  m("span", {class: "item-content"}, [
                    m("span", {class: "message-user"}, `${message.user}`),

                    message.user_id != Chat.vm.moderator() ? "" :
                      m("span", {class: "typcn typcn-eye"}),

                    m("span", {class:"message_date", config: convertTimestamp, datetime: `${message.at}` }, ""),
                    
                    m("div", {class: "talk-bubble"},`${message.body}`)
                  ])
                );
            })
            )
          
  }
}

let MessageInput = {
  vm: {
    txt: m.prop(""),
    send(){
      if (socket.connectionState() != "open") {
        showError("Service unavailable", "top right")
      } else if (MessageInput.vm.txt() != "") {
        Chat.vm.sendNewMessage(MessageInput.vm.txt())
        MessageInput.vm.txt("")
      } else {
        showLog("Fill in your input!", "bottom right")
      }
    },
  },
  controller(){ this.vm = MessageInput.vm; }, 
  view(ctrl) {
    return m("div", {id: "msg_input_wrap"}, [
           m("div", {id: "textarea-wrapper"},
            m("textarea", {class:"c-input", value: ctrl.vm.txt(), onchange: m.withAttr("value", ctrl.vm.txt), type: "text", rows: "1"})),
            
           m("span", {id: "submit-wrapper"},
           m("button", {id: "input-btn", onclick: ctrl.vm.send.bind(ctrl.vm), class: "c-btn c-btn--primary"}, "Send"))

         ])
  }
}

m.module(document.getElementById("main"), App);