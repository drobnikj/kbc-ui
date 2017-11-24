import Index from './react/Index';
import tokensActions from './actionCreators';
import StorageActions from '../components/StorageActionCreators';
import TokensStore from './StorageTokensStore';
import {Map} from 'immutable';

export default {
  name: 'tokens',
  title: 'Tokens',
  defaultRouteHandler: Index,
  requireData: [
    (params, query) => {
      return tokensActions.loadTokens().then(() => {
        const {tokenId} = query;
        if (tokenId) {
          const localState = TokensStore.localState();
          const token = TokensStore.getAll().find(t => t.get('id') === tokenId);
          if (!!token) {
            const manageTokenData = Map({token: token, show: true});
            const newLs = localState.setIn(['TokensTable', 'manageToken'], manageTokenData);
            tokensActions.updateLocalState(newLs);
          }
        }
      });
    },
    () => StorageActions.loadBuckets()
  ]
};
