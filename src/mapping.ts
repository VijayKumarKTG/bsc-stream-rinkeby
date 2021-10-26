import { BigInt } from '@graphprotocol/graph-ts';
import {
  BSC_Stream,
  CancelStream,
  CreateStream,
  WithdrawFromStream,
} from '../generated/BSC_Stream/BSC_Stream';
import { Stream } from '../generated/schema';

export function handleCancelStream(event: CancelStream): void {
  let stream = Stream.load(event.params.streamId.toString());
  if (stream) {
    stream.status = 'cancelled';
    stream.amount = event.params.recipientBalance;
    stream.save();
  }
  return;
}

export function handleCreateStream(event: CreateStream): void {
  let stream = Stream.load(event.params.streamId.toString());
  if (!stream) {
    stream = new Stream(event.params.streamId.toString());
  }
  stream.streamId = event.params.streamId;
  stream.deposit = event.params.deposit;
  stream.recipient = event.params.recipient;
  stream.stopTime = event.params.stopTime;
  stream.startTime = event.params.startTime;
  stream.sender = event.params.sender;
  stream.tokenAddress = event.params.tokenAddress;
  stream.tx = event.transaction.hash.toHexString();
  stream.status = 'active';
  stream.amount = new BigInt(0);
  stream.save();
}

export function handleWithdrawFromStream(event: WithdrawFromStream): void {
  let stream = Stream.load(event.params.streamId.toString());
  if (stream) {
    let sablier = BSC_Stream.bind(event.address);
    let result = sablier.try_getStream(event.params.streamId);
    if (result.reverted) {
      stream.status = 'withdrawn';
      stream.amount = event.params.amount.plus(stream.amount);
      stream.save();
    } else {
      stream.amount = event.params.amount.plus(stream.amount);
      stream.save();
    }
  }
}
