export enum BadgeRuleMetricEnum {
  /** correctCoverage across every trivia-bearing topic in the badge's scoped subject — same
   * measure subject_mastered already uses, parametrized by subject + threshold instead of
   * hardcoded. When paired with a BadgeRule.difficultyLevel, aggregates correct/total for just
   * that difficulty across all of the subject's topics (a single overall percentage), rather
   * than requiring every topic to individually clear the bar. */
  SUBJECT_CORRECT_COVERAGE = 'SubjectCorrectCoverage',

  /** correctCoverage for exactly one topic (the badge's own scopeId) — no "every topic" loop,
   * since the scope is already a single topic. Same difficultyLevel pairing as above, scoped to
   * just that one topic's questions at that level. */
  TOPIC_CORRECT_COVERAGE = 'TopicCorrectCoverage',
}
