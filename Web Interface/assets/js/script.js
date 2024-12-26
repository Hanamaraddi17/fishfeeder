/* Clock */
const hours = document.querySelector('.hours');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');

function clock() {
    let today = new Date();
    let h = today.getHours() % 12 + today.getMinutes() / 59; // 22 % 12 = 10pm
    let m = today.getMinutes(); // 0 - 59
    let s = today.getSeconds(); // 0 - 59

    h *= 30; // 12 * 30 = 360deg
    m *= 6;
    s *= 6; // 60 * 6 = 360deg

    rotation(hours, h);
    rotation(minutes, m);
    rotation(seconds, s);

    // call every second
    setTimeout(clock, 500);
}

function rotation(target, val) {
    target.style.transform = `rotate(${val}deg)`;
}

window.onload = clock();

// Function to toggle visibility of divs
function toggleDiv() {
    $('.components').toggle();
    $('.components2').toggle();
}

// Firebase initialization
const firebaseConfig = {
    apiKey: "AIzaSyBBZVTkgGO81HJTjkBGQ5zOVvhMVwswBEc",
    authDomain: "fish-feeder-17.firebaseapp.com",
    databaseURL: "https://fish-feeder-17-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fish-feeder-17",
    storageBucket: "fish-feeder-17.firebasestorage.app",
    messagingSenderId: "205690307963",
    appId: "1:205690307963:web:1940c14f28e280a90e29de",
    measurementId: "G-TWM16LC1Z3"
  };
firebase.initializeApp(firebaseConfig);

let count = 0; // Initialize count

var countRef = firebase.database().ref('count');
countRef.on('value', function(snapshot) {
    if (snapshot.exists()) {
        count = snapshot.val();
        console.log(count);
    } else {
        console.error("Count data is not available.");
    }
});

function feednow() {
    firebase.database().ref().update({
        feednow: 1
    });
}

$(document).ready(function() {
    $('#timepicker').mdtimepicker(); // Initialize the time picker
    addDiv(); // Call addDiv to load the timer data
});

$('#timepicker').mdtimepicker().on('timechanged', function(e) {
    console.log(e.time);
    addStore(count, e);
    count += 1;
    firebase.database().ref().update({
        count: parseInt(count),
    });
});

function addStore(count, e) {
    if (e && e.time) {
        firebase.database().ref('timers/timer' + count).set({
            time: e.time
        });
        addDiv();
    } else {
        console.error("Invalid time data:", e);
    }
}

function showShort(id) {
    var idv = $(id)[0]['id'];
    if (idv) {
        $("#time_" + idv).toggle();
        $("#short_" + idv).toggle();
    } else {
        console.error("Invalid ID:", idv);
    }
}

function removeDiv(id) {
    var idv = $(id)[0]['id'];
    if (idv) {
        firebase.database().ref('timers/' + idv).remove();
        if (count >= 0) {
            count -= 1;
        }
        firebase.database().ref().update({
            count: parseInt(count),
        });
        $(id).fadeOut(1, 0).fadeTo(500, 0);
    } else {
        console.error("Invalid ID:", idv);
    }
}

function addDiv() {
    var divRef = firebase.database().ref('timers');
    divRef.on('value', function(snapshot) {
        if (snapshot.exists()) {
            var obj = snapshot.val();
            var i = 0;
            $('#wrapper').html('');
            while (i <= count) {
                var propertyValues = Object.entries(obj);

                // Check if propertyValues[i][1] exists and contains the 'time' property
                if (propertyValues[i] && propertyValues[i][1] && propertyValues[i][1]['time']) {
                    let ts = propertyValues[i][1]['time'];

                    // Format the time string
                    var H = +ts.substr(0, 2);
                    var h = (H % 12) || 12;
                    h = (h < 10) ? ("0" + h) : h; // leading 0 for 1 digit hours
                    var ampm = H < 12 ? " AM" : " PM";
                    ts = h + ts.substr(2, 3) + ampm;
                    console.log(ts);

                    const x = `
                        <div id="${propertyValues[i][0]}">
                            <div class="btn2 btn__secondary2" onclick="showShort(${propertyValues[i][0]})" id="main_${propertyValues[i][0]}">
                                <div id="time_${propertyValues[i][0]}">${ts}</div>
                                <div class="icon2" id="short_${propertyValues[i][0]}" onclick="removeDiv(${propertyValues[i][0]})">
                                    <div class="icon__add">
                                        <ion-icon name="trash"></ion-icon>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    $('#wrapper').append(x);
                } else {
                    console.error(`Invalid or missing time data for timer:`, propertyValues[i]);
                }
                i++;
            }
        } else {
            console.error("No timers data available.");
        }
    });
}

