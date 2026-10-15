import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Question } from '../types/pokemon';
import { QUESTION_BANK } from '../types/questions';


const shuffleQuestions = (questions: Question[]): Question[] => {
  const shuffled = [...questions];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
};


const getQuizQuestions = (): Question[] => {
  return shuffleQuestions(QUESTION_BANK).slice(0, 10);
};

const QuizScreen = () => {

  const [questions, setQuestions] = useState<Question[]>(getQuizQuestions());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const question = questions[currentQuestion];

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(answerId);

    if (answerId === question.answer) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      return;
    }

    if (currentQuestion === questions.length - 1) {
      setQuizFinished(true);
      return;
    }

    setCurrentQuestion(prevQuestion => prevQuestion + 1);
    setSelectedAnswer(null);
  };

  const handleRetry = () => {
    setQuestions(getQuizQuestions());
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  };

  const getOptionStyle = (optionId: string) => {
    if (selectedAnswer === null) {
      return styles.option;
    }

    if (optionId === question.answer) {
      return [styles.option, styles.correctOption];
    }

    if (optionId === selectedAnswer) {
      return [styles.option, styles.wrongOption];
    }

    return [styles.option, styles.disabledOption];
  };

  const getOptionTextStyle = (optionId: string) => {
    if (selectedAnswer === null) {
      return styles.optionText;
    }

    if (optionId === question.answer) {
      return [styles.optionText, styles.correctOptionText];
    }

    if (optionId === selectedAnswer) {
      return [styles.optionText, styles.wrongOptionText];
    }

    return styles.optionText;
  };

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <View style={styles.resultCircle}>
            <Text style={styles.resultScore}>
              {score}/{questions.length}
            </Text>
            <Text style={styles.resultLabel}>Score</Text>
          </View>

          <Text style={styles.resultTitle}>Quiz Completed!</Text>

          <Text style={styles.resultPercentage}>
            {percentage}%
          </Text>

          <Text style={styles.resultMessage}>
            {percentage >= 80
              ? 'Excellent! You are a true Pokemon Master!'
              : percentage >= 50
                ? 'Good job! Keep learning about Pokemon!'
                : 'Keep practicing! You can become a Pokemon Master!'}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.retryButton}
            onPress={handleRetry}>
            <Text style={styles.retryButtonText}>
              Retry Quiz
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <Text style={styles.heading}>Pokemon Quiz</Text>

          <Text style={styles.questionCounter}>
            {currentQuestion + 1}/{questions.length}
          </Text>
        </View>

        <Text style={styles.questionNumber}>
          Question {currentQuestion + 1}
        </Text>

        <Text style={styles.questionText}>
          {question.question}
        </Text>

        <View style={styles.optionsContainer}>
          {question.options.map(option => (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              disabled={selectedAnswer !== null}
              style={getOptionStyle(option.id)}
              onPress={() => handleAnswer(option.id)}>

              <View style={styles.optionLetterContainer}>
                <Text style={styles.optionLetter}>
                  {option.id}
                </Text>
              </View>

              <Text style={getOptionTextStyle(option.id)}>
                {option.text}
              </Text>

              {selectedAnswer !== null &&
                option.id === question.answer && (
                  <Text style={styles.correctIcon}>
                    ✓
                  </Text>
                )}

              {selectedAnswer === option.id &&
                option.id !== question.answer && (
                  <Text style={styles.wrongIcon}>
                    ✕
                  </Text>
                )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedAnswer !== null && (
          <View style={styles.answerMessage}>
            <Text
              style={[
                styles.answerMessageText,
                selectedAnswer === question.answer
                  ? styles.correctMessage
                  : styles.wrongMessage,
              ]}>
              {selectedAnswer === question.answer
                ? 'Correct answer!'
                : `Correct answer: ${question.options.find(
                  option => option.id === question.answer,
                )?.text
                }`}
            </Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={selectedAnswer === null}
          style={[
            styles.nextButton,
            selectedAnswer === null &&
            styles.disabledNextButton,
          ]}
          onPress={handleNext}>

          <Text style={styles.nextButtonText}>
            {currentQuestion === questions.length - 1
              ? 'Finish Quiz'
              : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#777777',
  },

  questionNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF5353',
    marginBottom: 10,
  },

  questionText: {
    fontSize: 23,
    lineHeight: 32,
    fontWeight: '700',
    color: '#171717',
    marginBottom: 28,
  },

  optionsContainer: {
    gap: 14,
  },

  option: {
    minHeight: 65,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E1E2E8',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  correctOption: {
    borderColor: '#35B86B',
    backgroundColor: '#EAF9F0',
  },

  wrongOption: {
    borderColor: '#F05A5A',
    backgroundColor: '#FFF0F0',
  },

  disabledOption: {
    opacity: 0.55,
  },

  optionLetterContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F1F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  optionLetter: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555555',
  },

  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#292929',
  },

  correctOptionText: {
    color: '#21834A',
  },

  wrongOptionText: {
    color: '#D63E3E',
  },

  correctIcon: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 10,
    color: '#21834A',
  },

  wrongIcon: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 10,
    color: '#D63E3E',
  },

  answerMessage: {
    marginTop: 18,
    paddingHorizontal: 4,
  },

  answerMessageText: {
    fontSize: 15,
    fontWeight: '600',
  },

  correctMessage: {
    color: '#21834A',
  },

  wrongMessage: {
    color: '#D63E3E',
  },

  nextButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FF5353',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },

  disabledNextButton: {
    backgroundColor: '#C9CAD0',
  },

  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  resultCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 10,
    borderColor: '#FF5353',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  resultScore: {
    fontSize: 38,
    fontWeight: '800',
    color: '#171717',
  },

  resultLabel: {
    fontSize: 15,
    color: '#777777',
    marginTop: 2,
  },

  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#171717',
  },

  resultPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF5353',
    marginTop: 10,
  },

  resultMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    textAlign: 'center',
    marginTop: 15,
  },

  retryButton: {
    width: '100%',
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FF5353',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
