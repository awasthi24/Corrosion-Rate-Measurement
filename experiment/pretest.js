/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////

(function() {
  function buildQuiz() {
    // we'll need a place to store the HTML output
    const output = [];

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // we'll want to store the list of answer choices
      const answers = [];

      // and for each available answer...
      for (letter in currentQuestion.answers) {
        // ...add an HTML radio button
        answers.push(
          `<label>
            <input type="radio" name="question${questionNumber}" value="${letter}">
            ${letter} :
            ${currentQuestion.answers[letter]}
          </label>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="question"> ${currentQuestion.question} </div>
        <div class="answers"> ${answers.join("")} </div>`
      );
    });

    // finally combine our output list into one string of HTML and put it on the page
    quizContainer.innerHTML = output.join("");
  }

  function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll(".answers");

    // keep track of user's answers
    let numCorrect = 0;

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `input[name=question${questionNumber}]:checked`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      // if answer is correct
      if (userAnswer === currentQuestion.correctAnswer) {
        // add to the number of correct answers
        numCorrect++;

        // color the answers green
        //answerContainers[questionNumber].style.color = "lightgreen";
      } else {
        // if answer is wrong or blank
        // color the answers red
        answerContainers[questionNumber].style.color = "red";
      }
    });

    // show number of correct answers out of total
    resultsContainer.innerHTML = `${numCorrect} out of ${myQuestions.length}`;
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
 

/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////
const myQuestions = [
    {
      "question": "Which of the following is NOT required for electrochemical corrosion to occur?",
      "answers": {
        "a": "Anode",
        "b": "Cathode",
        "c": "Oxygen",
        "d": "Electrolyte"
      },
      "correctAnswer": "c",
      "difficulty": "beginner"
    },
    {
      "question": "What is the main function of the electrolyte in a corrosion cell?",
      "answers": {
        "a": "Acts as an insulator",
        "b": "Allows ion movement between electrodes",
        "c": "Prevents corrosion",
        "d": "Increases metal strength"
      },
      "correctAnswer": "b",
      "difficulty": "beginner"
    },
    {
      "question": "Which metal is most likely to corrode fastest in saltwater?",
      "answers": {
        "a": "Gold",
        "b": "Iron",
        "c": "Platinum",
        "d": "Stainless steel"
      },
      "correctAnswer": "b",
      "difficulty": "beginner"
    },
    {
      "question": "Increasing the temperature during a corrosion experiment generally:",
      "answers": {
        "a": "Decreases the corrosion rate",
        "b": "Has no effect",
        "c": "Increases the corrosion rate",
        "d": "Stops corrosion completely"
      },
      "correctAnswer": "c",
      "difficulty": "beginner"
    },
    {
      "question": "Which of the following is a common electrolyte used in laboratory corrosion experiments?",
      "answers": {
        "a": "Distilled water",
        "b": "Sodium chloride solution",
        "c": "Vegetable oil",
        "d": "Alcohol"
      },
      "correctAnswer": "b",
      "difficulty": "beginner"
    },
    {
      "question": "",
      "answers": {
        "a": "",
        "b": "",
        "c": "",
        "d": ""
      },
      "correctAnswer": "",
      "difficulty": "beginner"
    },
    {
      "question": "What is the primary measurement used to compare corrosion rates in different conditions?",
      "answers": {
        "a": "Weight loss of metal",
        "b": "Color change",
        "c": "Sound produced",
        "d": "Smell of solution"
    },
      "correctAnswer": "a",
      "difficulty": "beginner"
    },
    {
      "question": "Which type of corrosion is considered very dangerous and difficult to detect?",
      "answers": {
        "a": "Uniform corrosion",
        "b": "Pitting corrosion",
        "c": "Galvanic corrosion",
        "d": "Fretting corrosion"
      },
      "correctAnswer": "b",
      "difficulty": "beginner"
    },
    {
      "question": "What happens to the corrosion rate if the exposure time is increased in a controlled environment?",
      "answers": {
        "a": "It decreases",
        "b": "It remains constant",
        "c": "It increases",
        "d": "It fluctuates randomly"
      },
      "correctAnswer": "c",
      "difficulty": "beginner"
    },
    {
      "question": "",
      "answers": {
        "a": "",
        "b": "",
        "c": "",
        "d": ""
      },
      "correctAnswer": "c",
      "difficulty": "beginner"
    },
    {
      "question": "What is the purpose of setting different metals in a virtual corrosion lab?",
      "answers": {
        "a": "To observe color changes",
        "b": "To compare corrosion resistance",
        "c": "To measure melting point",
        "d": "To test electrical conductivity"
      },
      "correctAnswer": "b",
      "difficulty": "beginner"
    },
    {
      "question": "Which of the following best describes a protective oxide layer on a metal?",
      "answers": {
        "a": "Thin and non-adherent",
        "b": "Passivating and adherent",
        "c": "Brittle and easily removed",
        "d": "Always non-protective"
      },
      "correctAnswer": "b",
      "difficulty": "beginner"
    }




/////////////// Write the MCQ below in the exactly same described format ///////////////


                  ///// Write the correct option inside double quote
                  //                              ///// To add more questions, copy the section below 
    									                  ///// this line


    /* To add more MCQ's, copy the below section, starting from open curly braces ( { )
        till closing curly braces comma ( }, )

        and paste it below the curly braces comma ( below correct answer }, ) of above 
        question

    Copy below section

    {
      question: "This is question n?",
      answers: {
        a: "Option 1",
        b: "Option 2",
        c: "Option 3",
        d: "Option 4"
      },
      correctAnswer: "c"
    },

    Copy above section

    */




  ];




/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////


  // display quiz right away
  buildQuiz();

  // on submit, show results
  submitButton.addEventListener("click", showResults);
})();


/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////
