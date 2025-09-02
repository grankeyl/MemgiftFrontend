import posthog from 'posthog-js'

export function usePostHog() {
  posthog.init('phc_VHPkTr9RppMF7FTszYektUU0dZAPbp4JYRheFJwtrUF', {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2025-05-24',
    person_profiles: 'identified_only',
  })

  return { posthog }
}