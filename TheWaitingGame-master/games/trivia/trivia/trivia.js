// Trivia class
function Trivia() {
  // http://coursesweb.net/
  var obth = this;       // stores the object contained in 'this'
  var objfiles = {};     // stores the object with "category":"file_name" elements, received in setCateg()
  var level = 'level1';  // 'level1' with variant of answers, 'level2' with text field to write the answer
  var stopct = 0;        // if not 0, countdown-timer not continue, in startCT()
  var ctsec = 15;         // number of seconds for each quiz
  var nquizzes = 0;      // total number of quizzes
  var nquiz = 0;         // stores number of current quiz
  var canswer = '';      // for correct answer of current quiz

  var nqansw = 0;       // number of answered quizzes
  var nca = 0;          // number of correct answers
  var nia = 0;          // number of incorrect answers

  // trivia mode ('qindex' = gets the quiz from next index, 'qrandom' = gets the quiz with index randomly from "iquizzes")
  var qmode = 'qindex';
  var qctimer = 0;         // for countdown-timer (if is 1), shown in #sctimer
  var iquizzes = [];       // array with indexes of quizzes that must to get randomly

  // property /array stores the trivia elements ('que'=question, 'ca'=correct answer, 'ia'=array with incorrect answers)
  var quizzes = [];

  // sets the <select> list with categories, that will be added in #tcateg
  // Receives an object with "category":"file_name" elements, and the type of the files ('xml', or 'json')
  this.setCateg = function(objf, type) {
    objfiles = objf;
    var tcateg = '';  var propf = '';

    var i = 0;        // to can call the method that sets the quizzes, with the first file_name
    for(var prop in objfiles) {
      if(i === 0) propf = prop;
      i = 1;
      tcateg += '<option value='+ prop +'>'+ prop +'</option>';
    }

    // calls thee method to set the trivia quizzes of first category
    if(type == 'xml') obth.setQuizXML(propf);
    else obth.setQuizJSON(propf);

    // sets onchange event for <select> with method to call according to type, adds the select list
    var onchg = type == 'xml' ? 'onchange="obTrivia.setQuizXML(this.value)"' : 'onchange="obTrivia.setQuizJSON(this.value)"';
    if(document.getElementById('tcateg')) document.getElementById('tcateg').innerHTML = 'Trivia Category: <select '+ onchg +'>'+ tcateg +'</select>';
  }

  // create the XMLHttpRequest object, according browser
  var getXmlHttp = function() {
    // if browser suports XMLHttpRequest
    if (window.XMLHttpRequest) {
      // Cretes a instantce of XMLHttpRequest object
      xhttp = new XMLHttpRequest();
    }
    else {
      // for IE 5/6
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xhttp;
  }

  // this public function gets the XML DOM, parse and adds in quizzes property the trivia elements
  // receives the property name that has the file to access, in objfiles object
  this.setQuizXML = function(propf) {
    obth.resetTrivia();
    quizzes = [];
    iquizzes = [];
    var xhttp = getXmlHttp();           // calls the function for the XMLHttpRequest instance

    // make the request to get the file content
    xhttp.open("GET", 'trivia/'+ objfiles[propf] ,false);
    xhttp.send(null);
    var xml_dom = xhttp.responseXML;        // gets the XML DOM from xml file

    var arr_quiz = xml_dom.getElementsByTagName('quiz');         // gets an Array with all "quiz" tags
    nquizzes = arr_quiz.length;              // number of 'quiz' elements (total quizzes)

    // traverses the "arr_quiz" array
    for(var i=0; i<nquizzes; i++) {
      quizzes[i] = {};     // creates each element in quizzes array, an object that will conteins question elements

      // adds in quizzes each 'quiz' element with question (<que>), correct answer(<ca>), and incorrect answers(<ia>)
      quizzes[i]['que'] = arr_quiz[i].getElementsByTagName('que')[0].childNodes[0].nodeValue;      // question
      quizzes[i]['ca'] = arr_quiz[i].getElementsByTagName('ca')[0].childNodes[0].nodeValue;      // correct answer

      // sets an array with incorrect answers
      quizzes[i]['ia'] = [];
      var arr_ia = arr_quiz[i].getElementsByTagName('ia');
      var nr_ia = arr_ia.length;              // number of 'ia' elements

      // traverses the array with incorrect answers and adds them in quizzes[][ia]
      for(var i2=0; i2<nr_ia; i2++) {
        quizzes[i]['ia'][i2] = arr_ia[i2].childNodes[0].nodeValue;
      }
    }

    // adds in #totalq, and #ntotalq the total number of quizzes
    if(document.getElementById('totalq')) document.getElementById('totalq').innerHTML = nquizzes;
    if(document.getElementById('ntotalq')) document.getElementById('ntotalq').innerHTML = nquizzes;
  }

  // this public function gets the JSON object and stores it in quizzes property
  // receives the property name that has the file to access, in objfiles object
  this.setQuizJSON = function(propf) {
    obth.resetTrivia();
    quizzes = [];
    iquizzes = [];
    var xhttp = getXmlHttp();           // calls the function for the XMLHttpRequest instance

    // make the request to get the file content
    xhttp.open("GET", 'trivia/'+ objfiles[propf], true);
    xhttp.send(null);

    xhttp.onreadystatechange = function() {
      if(xhttp.readyState == 4) {
        var tobj = xhttp.responseText;         // puts in a variable the received data
        tobj = tobj.replace(/\\|\r\n|\n|\r/gm, '');       // remove slashes "\" and new lines
        eval("quizzes ="+ tobj);               // adds the JSON object in quizzes property
        nquizzes = quizzes.length;              // total number of quizzes

        // adds in #totalq, and #ntotalq the total number of quizzes
        if(document.getElementById('totalq')) document.getElementById('totalq').innerHTML = nquizzes;
        if(document.getElementById('ntotalq')) document.getElementById('ntotalq').innerHTML = nquizzes;
      }
    }
  }

  // creates the countdown timer
  var startCT = function() {
    // if ctsec is > 1
    if(ctsec >= 0) {
      // if countdown-timer not stoped (stopct is 0)
      if(stopct == 0 && document.getElementById('sctimer')) {
        document.getElementById('sctimer').innerHTML = ctsec;    // shows the countdown timer
        setTimeout(startCT, 1000);        // Auto-calls the function after 1 second
      }
      ctsec--;         // decreases the value with one unit
    }
    else obth.getAnswer(0);       // to show the correct answer
  }

  // sets the value for level property, receives the value
  this.setLevel = function(lvl) {
    level = lvl;
  }

  // sets the game mode (qindex or qrandom)
  var setQmode = function() {
    if(document.getElementById('qindex').checked == true) qmode = 'qindex';
    else if(document.getElementById('qrandom').checked == true) qmode = 'qrandom';
  }

  // sets the value of qctimer property, for countdown-timer
  this.setQctimer = function(btn) {
    if(btn.checked == true) qctimer = 1;
    else qctimer = 0;
  }

  // sets the array with quizzes index, returns a random index (stn is for 'start', or 'next')
  var setIQrandom = function(stn) {
    // if stn is 'start', sets iquizzes from beginning, else, removes the element with current quiz number from iquizzes
    if(stn == 'start') {
      for(var i=0; i<nquizzes; i++) iquizzes[i] = i;
    }
    else {
      // gets the index of item with value of number in nquiz, and removes it
      var nqr = iquizzes.length;     // number of quizzes index in iquizzes
      for(var i=0; i<nqr; i++) {
        if(iquizzes[i] == nquiz) {
          iquizzes.splice(i, 1);
          break;
        }
      }
      iquizzes.sort();       // resorts the array
    }

    return iquizzes[Math.floor(Math.random() * iquizzes.length)];
  }

  // sets the index number of current quiz (nquiz)
  var setNquiz = function(stn) {
    // if 'qmode' is 'qrandom' sets with setIQrandom()
    // else if stn is 'start' set nquiz with value added in "#nquiz", else, sets the index of next quiz
    if(qmode == 'qrandom') nquiz = setIQrandom(stn);
    else if(stn == 'start') {
      nquiz = document.getElementById('nquiz').value - 1;
      // if nquiz<0 or higher then number of quizzes, or not integer number, resets the game, and alerts message
      if(nquiz < 0 || nquiz >= nquizzes || !(typeof(nquiz)==="number" && Math.round(nquiz) == nquiz)) {
        obth.resetTrivia();
        alert('The value of Starting quiz number must be an integer number between 1 and '+ nquizzes);
      }
    }
    else {
      if(nquiz < (nquizzes - 1)) nquiz++;
      else obth.resetTrivia();    // if reached the last quiz
    }
  }

  // starts and shows the quiz, receives the way: 'start' or 'next' to set the index of current quiz
  this.sQuiz = function(stn) {
    setQmode();        // to set the game mode
    setNquiz(stn);     // to set the index of current quiz
    deBtns(['level1', 'level2', 'qindex', 'nquiz', 'qrandom', 'qctimer', 'squiz'], 'disable');     // to disable buttons (enable Reset)
    canswer = quizzes[nquiz]['ca'];       // stores correct answer

    if(document.getElementById('quiz')) {
      // to add countdown-timer if qctimer is different from 0
      var addct = (qctimer == 0) ? '' : '<div id="sctimer">0</div>';

      // increments the number of answered quizzes, calls answered() to display it
      nqansw++;
      answered();

      // shows the quiz number, quiz question, and element for answer (according to level)
      document.getElementById('quiz').innerHTML = addct +'<h4 id="qnr">Quiz No. '+ (nquiz + 1) +'</h4><h4 id="tquestion">&#9675; '+ quizzes[nquiz]['que'] +'</h4><div id="qansw">'+ (level == 'level1' ? qAnswerL1() : qAnswerL2()) +'</div>';

      // if qctimer is 1, sets the stopct and ctsec, calls the function for countdown-timer
      if(qctimer == 1) {
        stopct = 0;
        ctsec = 15;
        startCT();
      }
    }
  }

  // resets the trivia game, index-number of quiz, the value in #nquiz field, alerts message
  this.resetTrivia = function() {
    nquiz = 0;             // index-number of quiz
    qctimer = 0;           // to disable countdown-timer

    // reset answered data
    nqansw = 0; nca = 0; nia = 0;
    answered();

    deBtns(['level1', 'level2', 'qindex', 'nquiz', 'qrandom', 'qctimer', 'squiz'], 'enable');     // to enable buttons (disable Reset)
    document.getElementById('nquiz').value = 1;
    document.getElementById('qctimer').checked = false;
    document.getElementById('quiz').innerHTML = '<h3>Welcome to Trivia Game</h3><strong>Levels:</strong><ul><li>Level 1 - Easy - It is displayed a list of answers to each quiz. Click the correct answer.</li><li>Level 2 - Difficult - It is displayed a text box in which you must write the answer, then click on Send button.</li></ul><strong>Mode</strong><ul><li>Consecutive - The quiestions start from the quiz with index number added into a text field, and are added in their order till the last quiz.</li><li>Random - The quizzes are choosed randomly, till the last quiz, without repeat.</li></ul>&bull; <strong>Countdown Timer</strong> - If that button is checked, you have 15 seconds to answer till the next quiz is added automatically.<br/><br/> - Click the Start button to start the quizzes. The Reset button resets the Trivia.<div id="tfrom">From: <a href="http://coursesweb.net/" title="Web Programming and Development Courses">http://CoursesWeb.net</a></div>';
  }

  // to disable /enable buttons when Start /Reset Trivia, receives an Array with IDs of buttons, and 'disable' or 'enable'
  var deBtns = function(ids, de) {
    var nrids = ids.length;
    for(var i=0; i<nrids; i++) {
      if(de == 'disable') document.getElementById(ids[i]).setAttribute('disabled', 'disabled');
      else document.getElementById(ids[i]).removeAttribute('disabled');
    }

    // removes 'disabled' from Reset (when start), or adds 'disabled' to Reset (when Reset)
    if(de == 'disable') document.getElementById('treset').removeAttribute('disabled');
    else {
        document.getElementById('treset').setAttribute('disabled', 'disabled');
        document.getElementById("sbtn").disabled = false;
    }
  }

  // sets and returns the variant of answers (for Level 1)
  var qAnswerL1 = function() {
    var qhtml = '';       // quiz question
    var nr_ia = quizzes[nquiz]['ia'].length;     // number of incorrect answers

    // random number used to set randomly the position of correct answer
    var randomnr = Math.floor(Math.random() * nr_ia);

    // creates the options with answers
    for(var i=0; i<nr_ia; i++) {
      // if 'i' = randomnr, adds correct answer, and decrease the index, else, incorrect answer
      if(i == randomnr) {
        qhtml += '<div class="qanswer" onclick="obTrivia.getAnswer(this)">'+ canswer +'</div>';
        randomnr = -1;        // to not be again equal to i
        i--;
      }
      else qhtml += '<div class="qanswer" onclick="obTrivia.getAnswer(this)">'+ quizzes[nquiz]['ia'][i] +'</div>';
    }

    return qhtml;
  }

  // returns the text field to write answer (for Level 2)
  var qAnswerL2 = function() {
    return '<input type="text" id="qanswerl2" /><button onclick="obTrivia.getAnswer(document.getElementById(\'qanswerl2\'))">Send</button>';
  }

  // adds data in #answered box, number of answered quizzes, correct and incorrect answers
  var answered = function() {
    if(document.getElementById('ntotalq')) document.getElementById('ntotalq').innerHTML = nquizzes;
    if(document.getElementById('nqansw')) document.getElementById('nqansw').innerHTML = nqansw;
    if(document.getElementById('nca'))
    document.getElementById('nca').innerHTML = nca;
    if(document.getElementById('nia')) document.getElementById('nia').innerHTML = nia;
  }

  // method called when an answer is clicked, receives the object with answer
  this.getAnswer = function(answ){
    stopct = 1;           // to stop countdown-timer

    // sets the Correct /Incorrect, answ is 0 when auto-calls from startCT()
    if(document.getElementById('qansw')) {
      // gets the Answer, delete white-spaces and tags ('qanswerl2' is from text field - Level 2)
      if(answ != 0) var qanswer = answ.id == 'qanswerl2' ? answ.value.replace(/^\s+|\<+|\>+|\s+$/g, '') : answ.innerHTML.replace(/^\s+|\s+$/g, '');

      // sets Correct or Incorrect answer
      if(answ == 0) {
        nia++;       // incorrect answer
        var seeansw = '<h4 id="iansw">Time expired</h4><h4 id="cansw">The Correct answer is:</h4><div id="canswer">'+ canswer +'</div>';
      }
      else if(qanswer.toLowerCase() == canswer.toLowerCase()) {
        nca++;       // correct answer
        var seeansw = '<div id="canswer">'+ qanswer +'</div><h4 id="cansw">&gt; Correct</h4>';
      }
      else {
        nia++;       // incorrect answer
        var seeansw = '<strike>'+ qanswer +'</strike><h4 id="iansw">Incorrect, the correct answer is:</h4><div id="canswer">'+ canswer +'</div>';
      }

      answered();        // to show answered data

      // if 'qindex' mode and last quiz, adds message, else, adds Next Button
      seeansw += ((qmode == 'qindex' && nquiz == (nquizzes - 1)) || (qmode == 'qrandom' && iquizzes.length == 1)) ? '<h4> - <em>That was the last quiz</em>.</h4>' : '<button id="nextq" onclick="obTrivia.sQuiz(\'next\')">Next</button>';

      document.getElementById('qansw').innerHTML = seeansw;
    }
  }

      /* register events */
  // onclick on Radio buttons for Level
  if(document.getElementById('level1')) document.getElementById('level1').onclick = function(){obth.setLevel('level1');}
  if(document.getElementById('level2')) document.getElementById('level2').onclick = function(){obth.setLevel('level2');}
  // onclick on Radio buttons for mode, to show /hide the field for starting quiz number
  if(document.getElementById('qindex')) document.getElementById('qindex').onclick = function(){document.getElementById('startqn').style.display = 'block';}
  if(document.getElementById('qrandom')) document.getElementById('qrandom').onclick = function(){document.getElementById('startqn').style.display = 'none';}
  // onclick on Checkbox button for countdown-timer
  if(document.getElementById('qctimer')) document.getElementById('qctimer').onclick = function(){obth.setQctimer(this);}
  // onclick on Start button
  if(document.getElementById('squiz')) document.getElementById('squiz').onclick = function(){obth.sQuiz('start');}
  // onclick on Reset button
  if(document.getElementById('treset')) document.getElementById('treset').onclick = function(){obth.resetTrivia();}
}

var obTrivia = new Trivia();          // object of the Trivia class

// object with pairs with "Category_name" and the XML file with quizzes associated to each category
var files_xml = {'Boston':'boston.xml', 'BP':'bostonpizza.xml', 'Pizza':'pizza.xml'};

// calls the method that creates the list with categories for trivia added in xml files
obTrivia.setCateg(files_xml, 'xml');
