'use strict';

const source = Rx.Observable.fromEvent(window, 'keyup');
const gap = { gap: true };
const delay = 500;

const checkSequence = (data) =>
    data.buf.toString() === data.sequence.toString();

export default (sequence, callback) => {
  let sub = source
      .timestamp()
      .startWith(Object.create(gap))
      .bufferWithCount(2, 1)
      .concatMap(buf => {
        let ret;

        if (buf[0].gap) {
          ret = Rx.Observable.fromArray(buf);
        } else if (buf[1].timestamp - buf[0].timestamp <= delay) {
          ret = Rx.Observable.just(buf[1]);
        } else {
          ret = Rx.Observable.of(Object.create(gap), buf[1]);
        }

        return ret;
      })
      .map(x => x.gap ? '☺' : x.value.keyCode)
      .bufferWithCount(sequence.length, 1)
      .map(buf => ({ buf, sequence })) 
      .filter(checkSequence)
      .subscribeOnNext(callback);

  return sub.dispose.bind(sub);
};
