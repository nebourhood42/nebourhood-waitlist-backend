
enum OnboardingStatusEnum {
   NOT_STARTED = "NOT_STARTED",
   IN_PROGRESS = "IN_PROGRESS",
   COMPLETED = "COMPLETED"
}

type OnboardingStatus = keyof typeof OnboardingStatusEnum;