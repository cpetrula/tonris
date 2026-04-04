/**
 * Enrollment Model
 * Defines the Enrollment schema for childcare enrollment management
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const { EMAIL_REGEX } = require('../../utils/validation');

/**
 * Valid enrollment statuses
 */
const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WAITLISTED: 'waitlisted',
};

/**
 * Enrollment source - how the enrollment was submitted
 */
const ENROLLMENT_SOURCE = {
  WEBSITE: 'website',
  PHONE_AGENT: 'phone_agent',
  WALK_IN: 'walk_in',
};

/**
 * Schedule preference options
 */
const SCHEDULE_PREFERENCE = {
  FIVE_DAYS: 'five_days',
  THREE_DAYS: 'three_days',
  TWO_DAYS: 'two_days',
};

/**
 * Immunization status options
 */
const IMMUNIZATION_STATUS = {
  UP_TO_DATE: 'up_to_date',
  PARTIAL: 'partial',
  EXEMPT: 'exempt',
};

/**
 * Gender options
 */
const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
};

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id',
    },
  },

  // -- Child Information --
  childFirstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'child_first_name',
    validate: { len: [1, 100] },
  },
  childLastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'child_last_name',
    validate: { len: [1, 100] },
  },
  childDateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'child_date_of_birth',
  },
  childGender: {
    type: DataTypes.ENUM(...Object.values(GENDER)),
    allowNull: true,
    field: 'child_gender',
  },

  // -- Program Preferences --
  programPreference: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'program_preference',
    comment: 'e.g., infant, toddler, preschool, pre-k, school-age',
  },
  schedulePreference: {
    type: DataTypes.ENUM(...Object.values(SCHEDULE_PREFERENCE)),
    allowNull: true,
    field: 'schedule_preference',
  },
  preferredStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'preferred_start_date',
  },

  // -- Primary Guardian --
  guardianFirstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'guardian_first_name',
    validate: { len: [1, 100] },
  },
  guardianLastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'guardian_last_name',
    validate: { len: [1, 100] },
  },
  guardianEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'guardian_email',
    validate: {
      isValidEmail(value) {
        if (!EMAIL_REGEX.test(value)) {
          throw new Error('Invalid email format');
        }
      },
    },
  },
  guardianPhone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'guardian_phone',
  },
  guardianRelationship: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'guardian_relationship',
    comment: 'mother, father, guardian, grandparent, other',
  },
  guardianAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'guardian_address',
  },

  // -- Secondary Guardian (optional) --
  secondaryGuardianFirstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'secondary_guardian_first_name',
  },
  secondaryGuardianLastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'secondary_guardian_last_name',
  },
  secondaryGuardianPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'secondary_guardian_phone',
  },
  secondaryGuardianRelationship: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'secondary_guardian_relationship',
  },

  // -- Emergency Contact --
  emergencyContactName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'emergency_contact_name',
  },
  emergencyContactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'emergency_contact_phone',
  },
  emergencyContactRelationship: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'emergency_contact_relationship',
  },

  // -- Medical Information --
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  medicalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'medical_notes',
  },
  specialNeeds: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'special_needs',
  },
  immunizationStatus: {
    type: DataTypes.ENUM(...Object.values(IMMUNIZATION_STATUS)),
    allowNull: true,
    field: 'immunization_status',
  },
  physicianName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'physician_name',
  },
  physicianPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'physician_phone',
  },

  // -- Enrollment Metadata --
  status: {
    type: DataTypes.ENUM(...Object.values(ENROLLMENT_STATUS)),
    defaultValue: ENROLLMENT_STATUS.SUBMITTED,
    allowNull: false,
  },
  source: {
    type: DataTypes.ENUM(...Object.values(ENROLLMENT_SOURCE)),
    defaultValue: ENROLLMENT_SOURCE.WEBSITE,
    allowNull: false,
  },
  additionalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'additional_notes',
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'submitted_at',
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at',
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reviewed_by',
    comment: 'Employee/user who reviewed the enrollment',
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'review_notes',
  },
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['tenant_id', 'status'] },
    { fields: ['tenant_id', 'guardian_email'] },
    { fields: ['tenant_id', 'program_preference'] },
    { fields: ['submitted_at'] },
  ],
});

/**
 * Get enrollment data safe for API response
 */
Enrollment.prototype.toSafeObject = function() {
  return this.toJSON();
};

/**
 * Set up model associations
 */
Enrollment.setupAssociations = (_models) => {
  // Phase 2: associate with Child and Guardian models
};

module.exports = {
  Enrollment,
  ENROLLMENT_STATUS,
  ENROLLMENT_SOURCE,
  SCHEDULE_PREFERENCE,
  IMMUNIZATION_STATUS,
  GENDER,
};
