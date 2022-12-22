import { ActionFn, Context, Event, TransactionEvent } from "@tenderly/actions";
// Function is later referenced with this name
export const transferNotifierFn: ActionFn = async (
  context: Context,
  event: Event
) => {
  try {
    const txEvent = event as TransactionEvent;
  } catch (err) {
    console.error(err);
  }
  // Log so we can later see what's available in payload
  console.log(event);

  // Project secrets are accessed through context.
  // Secret must be created through dashboard before accessing it!
  // const apiasda sToken = await context.secrets.get('API_TOKEN')

  // Project storage is accessed through context
  // Fetch already saved transactions under HELLO_WORLD/TXS key
  const storedTxs = await context.storage.getJson("TRANSFER_NOTIFIER/TXS");
  if (!storedTxs["txs"]) {
    // Create new list if first
    storedTxs["txs"] = [event.hash];
  } else {
    // Otherwise append
    storedTxs["txs"].push(event.hash);
  }
  // Write to storage - don't forget the await!
  await context.storage.putJson("TRANSFER_NOTIFIER/TXS", storedTxs);
};

// Function must be exported
