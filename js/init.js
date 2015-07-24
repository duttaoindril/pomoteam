var pomoteam = new Firebase("https://pomoteam.firebaseio.com/");
var index = (window.location.href).indexOf("?me=");
var active = false;
var countdown = false;
var minutes;
var teamperson = 2;
var appantasklength = 0;
var jaggutasklength = 0;
var workAudio = new Audio('work.mp3');
workAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
var callAudio = new Audio("call.mp3");
callAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
var ding = new Audio("alert.mp3");

function n(n) {
    return n > 9 ? "" + n: "0" + n;
}

$( document ).ready(function(){
    $(".button-collapse").sideNav();
    if(screen.width < 800) {
        $("#adjusta").attr("class", "col s6");
        $("#adjustb").attr("class", "col s6");
        $("#adjustc").attr("class", "col s12");
        $("#appantasks").attr("class", "col s12");
        $("#jaggutasks").attr("class", "col s12");
    }
    if(index > 0 && (window.location.href).substr(index+4) === "appan") {
        teamperson = 1;
        $("#whome").html("I am Appan!");
    }
    setInterval(function(){
        if(countdown && teamperson == 1) {
            pomoteam.child("team1/timeleft").set(data["team1"]["timeleft"]-1);
            if(data["team1"]["timeleft"] == 0) {
                if(data["team1"]["work"]) {
                    ding.play();
                    ding.play();
                    ding.play();
                    pomoteam.child("team1/timeleft").set(data["team1"]["data"]["breaktime"]*60);
                }
                else
                    pomoteam.child("team1/timeleft").set(data["team1"]["data"]["worktime"]*60);
                pomoteam.child("team1/work").set(!data["team1"]["work"]);
            }
            var mins = Math.floor(data["team1"]["timeleft"]/60);
            $("#mins").html(n(mins));
            $("#secs").html(n(data["team1"]["timeleft"] - minutes*60));
        }
    }, 1000);
    setInterval(function(){
        $("#blink").fadeOut("slow");
        $("#blink").fadeIn("fast");
    }, 900);
});

pomoteam.child("team1/data/team/"+teamperson).set(active);
pomoteam.on("value", function(snapshot) {
    data = snapshot.val();
    if(countdown)
        if(data["team1"]["work"])
            $("#typetime").html("Work time!");
        else
            $("#typetime").html("Break! Talk! Have fun!!");
    else
        $("#typetime").html("Chill time!");
    if(data["team1"]["data"]["team"]["1"])
        $("#appanready").html("Ready!");
    else
        $("#appanready").html("Not Ready.");
    if(data["team1"]["data"]["team"]["2"])
        $("#jagguready").html("Ready!");
    else
        $("#jagguready").html("Not Ready.");
    minutes = Math.floor(data["team1"]["timeleft"]/60);
    $("#mins").html(n(minutes));
    $("#secs").html(n(data["team1"]["timeleft"] - minutes*60));
    if(appantasklength != Object.keys(data["tasks"]["1tasks"]).length)
    {
        clear(1);
        appantasklength = Object.keys(data["tasks"]["1tasks"]).length;
        for (var i = 0; i < appantasklength; i++)
            addp(data["tasks"]["1tasks"][i], 1);
        if(teamperson == 1)
            $("#appantasks .dismissable").each(function(i) {
                $(this).click(function() {
                    done($(this));
                });
            });
    }
    if(jaggutasklength != Object.keys(data["tasks"]["2tasks"]).length)
    {
        clear(2);
        jaggutasklength = Object.keys(data["tasks"]["2tasks"]).length;
        for (var i = 0; i < jaggutasklength; i++)
            addp(data["tasks"]["2tasks"][i], 2);
        if (teamperson == 2)
            $("#jaggutasks .dismissable").each(function(i) {
                $(this).click(function() {
                    done($(this));
                });
            });
    }
    countdown = data["team1"]["data"]["team"]["1"] && data["team1"]["data"]["team"]["2"];
    console.log(countdown + " | " + data["team1"]["work"] + " | " + data["team1"]["data"]["team"]["1"] + " | " + data["team1"]["data"]["team"]["2"]);
    if(countdown) {
        if(data["team1"]["work"]) {
            callAudio.pause();
            workAudio.play();
            $("nav").attr("class", "red darken-2" );
        }
        else if(!data["team1"]["work"]) {
            workAudio.pause();
            callAudio.play();
            $("nav").attr("class", "green darken-1" );
        }
    } else {
        if(data["team1"]["data"]["team"]["1"] || data["team1"]["data"]["team"]["2"])
        {
            ding.play();
            workAudio.pause();
            callAudio.play();
            $("nav").attr("class", "amber darken-2" );
        }
        else {
            workAudio.pause();
            callAudio.pause();
            $("nav").attr("class", "light-blue darken-1" );
        }
    }
});
$("#ready").click(function() {
    active = !active;
    console.log(active);
    if(active)
        $("#ready").html("pause! I am not ready.");
    else
        $("#ready").html("I am ready!");
    pomoteam.child("team1/data/team/"+teamperson).set(active);
});
$("#reset").click(function() {
    $("#ready").html("I am ready!");
    workAudio.pause();
    callAudio.pause();
    active = false;
    pomoteam.child("team1").set({
        "timeleft": 1500,
        "work": true,
        "timestarted": 0,
        "data": {
            "worktime": 25,
            "breaktime": 5,
            "team": {
                "1": false,
                "2": false
            }
        }
    });
});

$("#appantasks .center").click(function() {
    if(teamperson == 1)
        $("#appantasks .dismissable").each(function(i) {
            done($(this));
        });
});

$("#jaggutasks .center").click(function() {
    if(teamperson == 2)
        $("#jaggutasks .dismissable").each(function(i) {
            done($(this));
        });
});

$("#tasks .dismissable").each(function(i) {
    $(this).click(function() {
        done($(this));
    });
});

function clear(person) {
    if(person == 1)
        $("#appantasks .dismissable").each(function(i) {
            donep($(this), 1);
        });
    else if(person == 2)
        $("#jaggutasks .dismissable").each(function(i) {
            donep($(this), 2);
        });
}

function done(element) {
    taskName = element.html().substring(5, element.html().indexOf("<a"));
    element.remove();
    console.log(taskName);
    Materialize.toast('Task Completed! Nice!', 2000);
    pomoteam.once('value', function(dataSnapshot) {
        var array = dataSnapshot.val()["tasks"][""+teamperson+"tasks"];
        console.log(array);
        array.splice(array.indexOf(taskName), 1);
        pomoteam.child("tasks/"+teamperson+"tasks").set(array);
    });
}

function donep(element, person) {
    taskName = element.html().substring(5, element.html().indexOf("<a"));
    element.remove();
    console.log(taskName);
}

function add(task) {
    var num;
    if (task.indexOf("task") > -1 || task.length == 0)
        Materialize.toast('Write a task down!', 2000,'',function(){$('#modal1').openModal();});
    else if(teamperson == 1) {
        $("#appantasks ul").append('<li class="collection-item dismissable"><div>'+task+'<a href="#tasks" class="secondary-content"><i class="material-icons">done</i></a></div></li>');
        pomoteam.once('value', function(dataSnapshot) {
            var array = dataSnapshot.val()["tasks"]["1tasks"];
            if(array.indexOf(task) < 0)
                array.push(task);
            pomoteam.child("tasks/1tasks").set(array);
        });
    } else if(teamperson == 2) {
        $("#jaggutasks ul").append('<li class="collection-item dismissable"><div>'+task+'<a href="#tasks" class="secondary-content"><i class="material-icons">done</i></a></div></li>');
        pomoteam.once('value', function(dataSnapshot) {
            var array = dataSnapshot.val()["tasks"]["2tasks"];
            if(array.indexOf(task) < 0)
                array.push(task);
            pomoteam.child("tasks/2tasks").set(array);
        });
    }
}

function addp(task, person) {
    if (task == "task")
        Materialize.toast('Write a task down!', 2000,'',function(){$('#modal1').openModal();});
    else if(person == 1)
        $("#appantasks ul").append('<li class="collection-item dismissable"><div>'+task+'<a href="#tasks" class="secondary-content"><i class="material-icons">done</i></a></div></li>');
    else if(person == 2)
        $("#jaggutasks ul").append('<li class="collection-item dismissable"><div>'+task+'<a href="#tasks" class="secondary-content"><i class="material-icons">done</i></a></div></li>');
}