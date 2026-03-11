// Models for the NEET Coach native Android app

class UserModel {
  final String id;
  final String name;
  final String email;
  final String subscriptionTier; // 'free', 'pro', 'premium'
  final int xp;
  final int level;
  final int streak;
  final String? avatarUrl;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.subscriptionTier,
    required this.xp,
    required this.level,
    required this.streak,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'NEET Student',
      email: json['email']?.toString() ?? '',
      subscriptionTier: json['subscription_tier']?.toString() ?? 'free',
      xp: (json['xp'] as num?)?.toInt() ?? 0,
      level: (json['level'] as num?)?.toInt() ?? 1,
      streak: (json['streak'] as num?)?.toInt() ?? 0,
      avatarUrl: json['avatar_url']?.toString(),
    );
  }

  bool get isPro => subscriptionTier == 'pro' || subscriptionTier == 'premium';
  bool get isPremium => subscriptionTier == 'premium';
}

class QuestionModel {
  final String id;
  final String text;
  final String optionA;
  final String optionB;
  final String optionC;
  final String optionD;
  final String? correctAnswer;
  final String? explanation;
  final String subject;
  final String difficulty;
  final int? yearAsked;

  const QuestionModel({
    required this.id,
    required this.text,
    required this.optionA,
    required this.optionB,
    required this.optionC,
    required this.optionD,
    this.correctAnswer,
    this.explanation,
    required this.subject,
    required this.difficulty,
    this.yearAsked,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    return QuestionModel(
      id: json['id']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
      optionA: json['option_a']?.toString() ?? '',
      optionB: json['option_b']?.toString() ?? '',
      optionC: json['option_c']?.toString() ?? '',
      optionD: json['option_d']?.toString() ?? '',
      correctAnswer: json['correct_answer']?.toString(),
      explanation: json['explanation']?.toString(),
      subject: json['subject']?.toString() ?? 'Physics',
      difficulty: json['difficulty']?.toString() ?? 'medium',
      yearAsked: (json['year_asked'] as num?)?.toInt(),
    );
  }

  List<String> get options => [optionA, optionB, optionC, optionD];
  List<String> get optionKeys => ['A', 'B', 'C', 'D'];
}

class TestSession {
  final String testId;
  final List<QuestionModel> questions;
  final Map<String, String> answers; // questionId -> 'A'/'B'/'C'/'D'
  final Set<String> markedForReview;
  int currentIndex;
  final DateTime startTime;

  TestSession({
    required this.testId,
    required this.questions,
    Map<String, String>? answers,
    Set<String>? markedForReview,
    this.currentIndex = 0,
    DateTime? startTime,
  })  : answers = answers ?? {},
        markedForReview = markedForReview ?? {},
        startTime = startTime ?? DateTime.now();

  void answer(String questionId, String option) {
    answers[questionId] = option;
  }

  void toggleMark(String questionId) {
    if (markedForReview.contains(questionId)) {
      markedForReview.remove(questionId);
    } else {
      markedForReview.add(questionId);
    }
  }

  int get timeSpentSeconds =>
      DateTime.now().difference(startTime).inSeconds;

  int get answeredCount => answers.length;
  int get unansweredCount => questions.length - answeredCount;
}

class TestResult {
  final int score;
  final int maxScore;
  final int correct;
  final int incorrect;
  final int unattempted;
  final double accuracy;
  final int timeTakenSeconds;
  final List<QuestionModel> questions;
  final Map<String, String> userAnswers;

  const TestResult({
    required this.score,
    required this.maxScore,
    required this.correct,
    required this.incorrect,
    required this.unattempted,
    required this.accuracy,
    required this.timeTakenSeconds,
    required this.questions,
    required this.userAnswers,
  });

  factory TestResult.fromJson(Map<String, dynamic> json) {
    final qs = (json['questions'] as List<dynamic>? ?? [])
        .map((q) => QuestionModel.fromJson(q as Map<String, dynamic>))
        .toList();
    final answers = Map<String, String>.from((json['answers'] as Map?) ?? {});
    return TestResult(
      score: (json['score'] as num?)?.toInt() ?? 0,
      maxScore: (json['maxScore'] as num?)?.toInt() ?? 720,
      correct: (json['correct'] as num?)?.toInt() ?? 0,
      incorrect: (json['incorrect'] as num?)?.toInt() ?? 0,
      unattempted: (json['unattempted'] as num?)?.toInt() ?? 0,
      accuracy: (json['accuracy'] as num?)?.toDouble() ?? 0.0,
      timeTakenSeconds: (json['timeTaken'] as num?)?.toInt() ?? 0,
      questions: qs,
      userAnswers: answers,
    );
  }
}

class LeaderboardEntry {
  final String userId;
  final String name;
  final int xp;
  final int level;
  final int streak;
  final int rank;

  const LeaderboardEntry({
    required this.userId,
    required this.name,
    required this.xp,
    required this.level,
    required this.streak,
    required this.rank,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json, int rank) {
    return LeaderboardEntry(
      userId: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Anonymous',
      xp: (json['xp'] as num?)?.toInt() ?? 0,
      level: (json['level'] as num?)?.toInt() ?? 1,
      streak: (json['streak'] as num?)?.toInt() ?? 0,
      rank: rank,
    );
  }
}

class BattleParticipant {
  final String userId;
  final String name;
  final int level;
  final int score;
  final int correct;
  final bool submitted;
  final bool isMe;

  const BattleParticipant({
    required this.userId,
    required this.name,
    required this.level,
    required this.score,
    required this.correct,
    required this.submitted,
    required this.isMe,
  });

  factory BattleParticipant.fromJson(Map<String, dynamic> json) {
    return BattleParticipant(
      userId: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Opponent',
      level: (json['level'] as num?)?.toInt() ?? 1,
      score: (json['score'] as num?)?.toInt() ?? 0,
      correct: (json['correct'] as num?)?.toInt() ?? 0,
      submitted: json['submitted'] as bool? ?? false,
      isMe: json['isMe'] as bool? ?? false,
    );
  }
}
