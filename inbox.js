document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
  document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
  document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  document.querySelector("#compose-form").onsubmit = function () {
    send_email();
    return false;
  };
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";

  get_emails(mailbox);
  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

}

function load_mail(mail_id, sender, recipients, subject, time, body, archived) { 
  
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";

  var mailbox = document.getElementsByTagName("h3")[0].innerHTML;

  const archive_button = document.createElement("button");
  const reply_button = document.createElement("button");
  reply_button.innerHTML = "Reply";

  archive_button.classList.add('btn', 'btn-sm', 'btn-outline-primary');

  reply_button.classList.add('btn', 'btn-sm', 'btn-outline-primary');


  if (mailbox == "Inbox") {
    archive_button.innerHTML = "Archive";
    archive_button.style.marginRight = "10px";
    archive_button.addEventListener("click", function() {
      archive_status(mail_id, archived)
    });
  }
  if (mailbox == "Archive") {
    archive_button.innerHTML = "Unarchive";
    archive_button.style.marginRight = "10px";
    archive_button.addEventListener("click", function() {
      archive_status(mail_id, archived)
    });
  }
  if (mailbox == "Sent") { 
    archive_button.style.display = "none"
  }

  reply_button.addEventListener("click", function () { 
    reply(sender, subject, body, time);
  })

  document.querySelector("#email-view").innerHTML = `<div><span style="font-weight: bold"> From: </span>${ sender }</div>
                                                     <div><span style="font-weight: bold"> To: </span> ${ recipients }</div>
                                                     <div><span style="font-weight: bold"> Subject: </span> ${ subject }</div>
                                                     <div><span style="font-weight: bold"> Timestamp: </span> ${ time }</div>
                                                     <hr>
                                                     <div style = "margin-bottom: 75px" >${ body }<div>
                                                     `
  document.querySelector("#email-view").append(archive_button);
  document.querySelector("#email-view").append(reply_button);
  
  document.querySelector("#compose-form").onsubmit = function () {
    send_email();
    return false;
  };
}

function send_email() {
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      localStorage.clear();
      load_mailbox("sent");
    });
  
}

function get_emails(mailbox) {
  fetch("/emails/" + mailbox)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails
      console.log(emails)
      emails.forEach(email => {
        id = email.id;
        sender = email.sender;
        subject = email.subject;
        time = email.timestamp;
        read = email.read;
        print_mailbox(sender, subject, time, id, read);
      })
    });
}

function print_mailbox(sender, subject, time, id, read) { 
  const element = document.createElement("div");
  element.innerHTML = `<div class="container">
                          <div class="row">
                            <div class="col-2" style="font-weight: bold">
                              ${ sender }
                            </div>
                            <div class="col-7">
                              ${ subject }
                            </div>
                            <div class="col-3">
                              <div style="float: right">
                                ${ time }
                              </div>
                            </div>
                          </div>
                        </div>`
  element.style.border = "1px solid black";
  element.style.padding = "5px";
  if (read === false) {
    element.style.backgroundColor = "white";
  }
  else if (read === true) { 
    element.style.backgroundColor = "#e9ecef";
  }
  element.addEventListener("click", function() {
    console.log("This element has been clicked!")
    get_email(id);
  });
  document.querySelector("#emails-view").append(element);
}

function read_status(id) { 
  fetch('/emails/'+ id, {
  method: 'PUT',
  body: JSON.stringify({
    read: true
  })
  })
}

function archive_status(id, archived) { 
  fetch('/emails/' + id, {
  method: 'PUT',
  body: JSON.stringify({
    archived: !archived
  })
  })
  .then(() => {
    localStorage.clear();
    load_mailbox("inbox");
    });
}

function get_email(id) { 
  fetch('/emails/' + id)
.then(response => response.json())
.then(email => {
    // Print email
  console.log(email);
  mail_id = email.id;
  sender = email.sender;
  recipients = email.recipients;
  subject = email.subject;
  time = email.timestamp;
  body = email.body;
  archived = email.archived;
  load_mail(mail_id, sender, recipients, subject, time, body, archived);
  })
  read_status(id);
}

function reply(sender, subject, body, time) { 

  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  let subject_of_mail = subject;

  document.querySelector("#compose-recipients").value = sender;

  if (subject_of_mail.startsWith("Re:")) {
    document.querySelector("#compose-subject").value = subject;
  }
  else { 
    document.querySelector("#compose-subject").value = "Re:" + " " + subject;
  }
  document.querySelector("#compose-body").value = "On" + " " + time + " " + sender + " " + "wrote:" + " " + body;

}
