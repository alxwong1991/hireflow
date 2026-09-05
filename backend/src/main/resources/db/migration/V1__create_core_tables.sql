CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,

    role VARCHAR(30) NOT NULL CHECK (role IN ('EMPLOYEE', 'EMPLOYER')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee_profiles (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(150),
    summary TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE employer_profiles (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    company_name VARCHAR(150) NOT NULL,
    company_description TEXT,
    website VARCHAR(255),
    location VARCHAR(150),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employer_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,

    employer_profile_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,

    location VARCHAR(150),
    employment_type VARCHAR(30) NOT NULL CHECK (
        employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY')
    ),

    salary_min INTEGER,
    salary_max INTEGER,

    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (
        status IN ('DRAFT', 'OPEN', 'CLOSED')
    ),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,

    CONSTRAINT fk_jobs_employer_profile
        FOREIGN KEY (employer_profile_id)
        REFERENCES employer_profiles(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_jobs_salary_range
        CHECK (
            salary_min IS NULL
            OR salary_max IS NULL
            OR salary_min <= salary_max
        )
);

CREATE TABLE job_applications (
    id BIGSERIAL PRIMARY KEY,

    job_id BIGINT NOT NULL,
    employee_profile_id BIGINT NOT NULL,

    cover_letter TEXT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED' CHECK (
        status IN ('APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN')
    ),

    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_job_applications_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_job_applications_employee_profile
        FOREIGN KEY (employee_profile_id)
        REFERENCES employee_profiles(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_job_employee_application
        UNIQUE (job_id, employee_profile_id)
);