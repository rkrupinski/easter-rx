'use strict';

const source = Rx.Observable.fromEvent(window, 'keyup');
const gap = { gap: true };
const delay = 500;


export default (sequence, callback) => {
  const pattern = sequence.toString();

  let sub = source
      .map(evt => evt.keyCode)
      .timeInterval()
      .startWith(Object.create(gap))
      .bufferWithCount(2, 1)
      .concatMap(buf => {
        let ret;

        switch (true) {
          case buf[0].gap:
            ret = Rx.Observable.fromArray(buf);
            break
          case buf[1].interval > delay:
            ret = Rx.Observable.of(Object.create(gap), buf[1]);
            break;
          default:
            ret = Rx.Observable.just(buf[1]);
        }

        return ret;
      })
      .pluck('value')
      .bufferWithCount(sequence.length, 1)
      .filter(x => x.toString() === pattern)
      .subscribeOnNext(callback);

  return sub.dispose.bind(sub);
};
