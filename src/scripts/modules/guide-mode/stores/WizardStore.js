import Dispatcher from '../../../Dispatcher';
import StoreUtils from '../../../utils/StoreUtils';
import {ActionTypes} from './ActionCreators';
import wizardLessons from '../WizardLessons';
import RoutesStore from '../../../stores/RoutesStore';

let store = {
  showLessonModal: true,
  lessonNumber: 1,
  step: 1
};

const containsAction = (dispatchedAction, action) => {
  return Object.keys(action).reduce(
    (memo, key) => memo && dispatchedAction[key] && dispatchedAction[key] === action[key]
    , true);
};

const WizardStore = StoreUtils.createStore({
  getState: () => store,
  getCurrentLesson: () => wizardLessons[store.lessonNumber],
  getNextLink: () => {
    const lesson = wizardLessons[store.lessonNumber];
    const nextStep = lesson ? lesson.steps[store.step] || {} : {};
    const nextLink = nextStep.link;
    const matchLink = nextStep.matchLink;
    if (nextLink) return nextLink;
    if (matchLink) {
      const router = RoutesStore.getRouter();
      const path = router.getCurrentPath();
      const nextPathMatch = path.match(matchLink);
      const nextPath = nextPathMatch ? nextPathMatch[0] : null;
      return nextPath;
    }
    return null;
  },
  getCurrentStep: () => {
    const lesson = wizardLessons[store.lessonNumber];
    return lesson ? lesson.steps[store.step] || {} : {};
  }
});

Dispatcher.register((payload) => {
  let action = payload.action;
  const  nextStepDispatchAction = WizardStore.getCurrentStep().nextStepDispatchAction;
  if (nextStepDispatchAction && containsAction(action, nextStepDispatchAction)) {
    store.step = store.step + 1;
    WizardStore.emitChange();
    const nextLink = WizardStore.getNextLink();
    if (nextLink) {
      RoutesStore.getRouter().transitionTo(nextLink);
    }
    return null;
  }

  switch (action.type) {
    case ActionTypes.GUIDE_WIZARD_SET_STEP:
      store.step = action.step;
      return WizardStore.emitChange();
    case ActionTypes.UPDATE_WIZARD_MODAL_STATE:
      store = {
        showLessonModal: action.showLessonModal,
        lessonNumber: action.lessonNumber,
        step: action.showLessonModal ? store.step : 0
      };
      return WizardStore.emitChange();
    default:
  }
});

export default WizardStore;
