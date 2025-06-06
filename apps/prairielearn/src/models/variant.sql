-- BLOCK select_variant_by_id
SELECT
  v.*
FROM
  variants AS v
WHERE
  v.id = $variant_id;

-- BLOCK reset_variants_for_assessment_question
UPDATE variants AS v
SET
  broken_at = CURRENT_TIMESTAMP,
  broken_by = $authn_user_id,
  modified_at = CURRENT_TIMESTAMP
FROM
  instance_questions AS iq
  JOIN assessment_questions AS aq ON (iq.assessment_question_id = aq.id)
WHERE
  v.instance_question_id = iq.id
  AND v.open = true
  AND v.broken_at IS NULL
  AND aq.id = $unsafe_assessment_question_id
  AND aq.assessment_id = $assessment_id;

-- BLOCK reset_variants_for_instance_question
UPDATE variants AS v
SET
  broken_at = CURRENT_TIMESTAMP,
  broken_by = $authn_user_id,
  modified_at = CURRENT_TIMESTAMP
FROM
  instance_questions AS iq
WHERE
  v.instance_question_id = iq.id
  AND v.open = true
  AND v.broken_at IS NULL
  AND iq.id = $unsafe_instance_question_id
  AND iq.assessment_instance_id = $assessment_instance_id;

-- BLOCK select_variant_by_instance_question_id
WITH
  variant_max_submission_scores AS (
    SELECT
      v.id AS variant_id,
      max(s.score) AS max_submission_score
    FROM
      instance_questions AS iq
      JOIN variants AS v ON (v.instance_question_id = iq.id)
      JOIN submissions AS s ON (s.variant_id = v.id)
    WHERE
      iq.assessment_instance_id = $assessment_instance_id
      AND (
        $instance_question_id::BIGINT IS NULL
        OR iq.id = $instance_question_id
      )
      AND s.score IS NOT NULL
    GROUP BY
      v.id
  )
SELECT
  v.id,
  v.instance_question_id,
  v.open,
  COALESCE(vmss.max_submission_score, 0) AS max_submission_score
FROM
  instance_questions AS iq
  JOIN variants AS v ON (v.instance_question_id = iq.id)
  LEFT JOIN variant_max_submission_scores AS vmss ON (vmss.variant_id = v.id)
WHERE
  iq.assessment_instance_id = $assessment_instance_id
  AND (
    $instance_question_id::BIGINT IS NULL
    OR iq.id = $instance_question_id
  )
  AND v.broken_at IS NULL
ORDER BY
  v.date;

-- BLOCK select_user_owns_variant
SELECT
  (
    CASE
      WHEN ai.group_id IS NOT NULL THEN EXISTS (
        SELECT
          1
        FROM
          group_users AS gu
        WHERE
          gu.group_id = ai.group_id
          AND gu.user_id = $user_id
      )
      ELSE (v.user_id = $user_id)
    END
  ) AS user_owns_variant
FROM
  variants AS v
  LEFT JOIN instance_questions AS iq ON (iq.id = v.instance_question_id)
  LEFT JOIN assessment_instances AS ai ON (ai.id = iq.assessment_instance_id)
WHERE
  v.id = $variant_id;
