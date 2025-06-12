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
        `<div class=question> ${currentQuestion.question} </div>
        <div class=answers> ${answers.join("")} </div>`
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
      const selector = input[name=question${questionNumber}]:checked;
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
    resultsContainer.innerHTML = ${numCorrect} out of ${myQuestions.length};
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
 

/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////
const myQuestions = [
    {
      question: "After increasing the temperature in your simulation, what was the observed effect on the corrosion rate?",
      answers: {
        a: "It decreased",
        b: "It stayed the same",
        c: "It increased",
        d: "It fluctuated randomly"
      },
      correctAnswer: "c",
      difficulty: "beginner"
    },
    {
      question: "Which metal showed the highest resistance to corrosion in your virtual experiment?",
      answers: {
        a: "Iron",
        b: "Copper",
        c: "Zinc",
        d: "Stainless steel"
      },
      correctAnswer: "d",
      difficulty: "beginner"
    },
    {
      question: "What was the effect of using a higher concentration electrolyte on corrosion rate?",
      answers: {
        a: "Decreased the rate",
        b: "No effect",
        c: "Increased the rate",
        d: "Stopped corrosion"
      },
      correctAnswer: "c",
      difficulty: "beginner"
    },
    {
      question: "When you increased the exposure time, what happened to the total weight loss of the metal?",
      answers: {
        a: "It decreased",
        b: "It remained the same",
        c: "It increased",
        d: "It fluctuated"
      },
      correctAnswer: "c",
      difficulty: "beginner"
    },
    {
      question: "Which parameter did you find most influential in accelerating corrosion in your simulation?",
      answers: {
        a: "Type of metal",
        b: "Color of solution",
        c: " Shape of metal",
        d: "Size of container"
      },
      correctAnswer: "a",
      difficulty: "beginner"
    },
    {
      question: "What role did the electrolyte play in your experiment?",
      answers: {
        a: "Prevented corrosion",
        b: "Allowed ion movement and completed the circuit",
        c: "Made the solution colorful",
        d: "Increased metal strength"
      },
      correctAnswer: "b",
      difficulty: "beginner"
    },
    {
      question: "What type of corrosion did you observe when using two different metals in the same electrolyte?",
      answers: {
        a: "Uniform corrosion",
        b: "Galvanic corrosion",
        c: "Pitting corrosion",
        d: "Stress corrosion"
    },
      correctAnswer: "b",
      difficulty: "beginner"
    },
    {
      question: "How did changing the metal affect the results of your corrosion experiment?",
      answers: {
        a: "No effect",
        b: "All metals corroded equally",
        c: "Some metals corroded faster than others",
        d: "Only non-metals corroded"
      },
      correctAnswer: "c",
      difficulty: "beginner"
    },
    {
      question: "Why is it important to control the temperature during corrosion experiments?",
      answers: {
        a: "To keep the solution clear",
        b: "To ensure consistent and reliable results",
        c: "To prevent evaporation",
        d: "To change the color of metal"
      },
      correctAnswer: "b",
      difficulty: "beginner"
    },
    {
      question: "What conclusion can you draw about the relationship between electrolyte concentration and corrosion rate?",
      answers: {
        a: "Higher concentration decreases corrosion rate",
        b: "Higher concentration increases corrosion rate",
        c: "No relationship",
        d: "Corrosion stops at higher concentration"
      },
      correctAnswer: "b",
      difficulty: "beginner"
    }




/////////////// Write the MCQ below in the exactly same described format ///////////////


             ///// To add more questions, copy the section below 
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
