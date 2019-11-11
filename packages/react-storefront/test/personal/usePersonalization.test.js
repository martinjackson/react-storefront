import React from 'react'
import { mount } from 'enzyme'
import { types } from 'mobx-state-tree'
import AppContext from '../../src/AppContext'
import { PageContext } from '../../src/Pages'
import usePersonalization from '../../src/personal/usePersonalization'
import AppModelBase from '../../src/model/AppModelBase'
import ProductModelBase from '../../src/model/ProductModelBase'

describe('usePersonalization', () => {
  let AppModel, ProductModel, loadPersonalization, Test

  beforeEach(() => {
    loadPersonalization = jest.fn()

    ProductModel = types.compose(
      ProductModelBase,
      types.model('ProductModel', {}).actions(self => ({
        loadPersonalization
      }))
    )

    AppModel = types.compose(
      AppModelBase,
      types.model('AppModel', {
        product: types.maybeNull(ProductModel)
      })
    )

    const Comp = () => {
      usePersonalization(app => app.product)
      return null
    }

    Test = ({ app, page }) => (
      <AppContext.Provider value={{ app }}>
        <PageContext.Provider value={page || app.page}>
          <Comp />
        </PageContext.Provider>
      </AppContext.Provider>
    )
  })

  it('should call the loadPersonalization method on the branch when model changes', () => {
    const app = AppModel.create({ loading: true, page: 'Product' })

    mount(<Test app={app} />)

    app.applyState({
      loading: false,
      product: {
        id: '1'
      }
    })

    expect(loadPersonalization).toHaveBeenCalled()
  })

  it('should not fire when loading', () => {
    const app = AppModel.create({ loading: true, page: 'Product' })

    mount(<Test app={app} />)

    app.applyState({
      product: {
        id: '1'
      }
    })

    expect(loadPersonalization).not.toHaveBeenCalled()
  })

  it('should not fire unless the page context matches the current page', () => {
    const app = AppModel.create({ loading: true, page: 'Product' })

    mount(<Test app={app} page="Subcategory" />)

    app.applyState({
      loading: false,
      product: {
        id: '1'
      }
    })

    expect(loadPersonalization).not.toHaveBeenCalled()
  })

  it('should not fire if another branch changes', () => {
    const app = AppModel.create({ loading: true, page: 'Product' })

    mount(<Test app={app} />)

    app.applyState({
      loading: false,
      category: {
        id: '1'
      }
    })

    expect(loadPersonalization).not.toHaveBeenCalled()
  })
})
