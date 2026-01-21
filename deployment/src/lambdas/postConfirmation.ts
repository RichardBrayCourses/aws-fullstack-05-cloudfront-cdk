import { PostConfirmationTriggerEvent } from "aws-lambda";

export const handler = async (
  event: PostConfirmationTriggerEvent,
): Promise<PostConfirmationTriggerEvent> => {
  console.log("PostConfirmation Trigger Fired for user:", event.userName);
  console.log("Full event:", JSON.stringify(event, null, 2));

  const userAttributes = event.request?.userAttributes;
  console.log(`User attributes:`, JSON.stringify(userAttributes));

  // event.userName is the most reliable source for username (always present)
  // It contains the user's unique identifier (sub) or username
  const username = event.userName;

  // Email should be in userAttributes.email (standard attribute)
  // Fallback to event.userName if email not found (though this shouldn't happen)
  const email = userAttributes?.email ?? event.userName;

  console.log(`username: ${username} email: ${email}`);

  return event;
};
