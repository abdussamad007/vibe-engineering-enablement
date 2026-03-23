export interface Category {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
}

export interface SurveyResponse {
  id?: number;
  teamName: string;
  respondentName: string;
  categoryScores: Record<string, number>;
  totalScore: number;
  submittedAt?: string;
  submitted_at?: string;
}

export const SURVEY_CATEGORIES: Category[] = [
  {
    id: 'dev-env',
    name: 'Development Environment',
    description: 'Local setup, tooling, and developer experience.',
    questions: [
      { id: 'q1', text: 'How easy is it to set up a new local development environment?' },
      { id: 'q2', text: 'How satisfied are you with the build times for your primary projects?' },
      { id: 'q3', text: 'How effective are the local debugging and testing tools?' }
    ]
  },
  {
    id: 'cicd',
    name: 'CI/CD & Deployment',
    description: 'Automation, pipeline reliability, and deployment frequency.',
    questions: [
      { id: 'q4', text: 'How automated is your deployment process?' },
      { id: 'q5', text: 'How reliable are your CI pipelines (frequency of false failures)?' },
      { id: 'q6', text: 'How quickly can you roll back a failed deployment?' }
    ]
  },
  {
    id: 'observability',
    name: 'Observability',
    description: 'Monitoring, logging, and incident response.',
    questions: [
      { id: 'q7', text: 'How clear is the visibility into system health in production?' },
      { id: 'q8', text: 'How easy is it to trace a request through the entire stack?' },
      { id: 'q9', text: 'How effective are the alerting mechanisms for critical issues?' }
    ]
  },
  {
    id: 'culture',
    name: 'Culture & Collaboration',
    description: 'Knowledge sharing, code reviews, and team dynamics.',
    questions: [
      { id: 'q10', text: 'How effective is the code review process in your team?' },
      { id: 'q11', text: 'How well is technical knowledge shared across the organization?' },
      { id: 'q12', text: 'How supported do you feel in taking time for technical debt reduction?' }
    ]
  }
];
