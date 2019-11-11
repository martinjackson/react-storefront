/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */
import { useEffect, useContext, useRef } from 'react'
import AppContext from '../AppContext'
import { reaction } from 'mobx'
import { PageContext } from '../Pages'

/**
 * A hook for fetching late-loaded personalized data.  This hook automatically
 * calls the `loadPersonalization()` method on the model in the specified `branch` in the app
 * state tree whenever the model's id field changes.
 *
 * Example
 *
 * ```js
 * function Product() {
 *   usePersonalization(app => app.product)
 *   return //...
 * }
 * ```
 *
 * @param {Function} branch A function that returns the model that should fetch personalized data.
 * @returns {Function}
 */
export default function usePersonalization(branch) {
  const { app } = useContext(AppContext)
  const pageContext = useContext(PageContext)
  const id = useRef(null)

  const loadPersonalization = async ({ loading, page, model }) => {
    if (model == null) {
      return
    } else if (model.loadPersonalization) {
      if (pageContext === page && !loading) {
        id.current = model.id
        model.loadPersonalization()
      }
    } else {
      console.warn(
        `The model at ${branch} does not implement loadPersonalization.  You should implement this action so that usePersonalization/withPersonalization can load personalized data from the server.`
      )
    }
  }

  const shouldFetchPersonalization = () => ({
    loading: app.loading,
    page: app.page,
    model: branch(app)
  })

  useEffect(() => {
    // check if we should load personalization data immediately as is the case if
    // the user initially lands on a page with usePersonalization
    loadPersonalization(shouldFetchPersonalization())

    // it is critical that we return the reaction disposer here (returned by reaction)
    // so that the reaction is disposed when the component unmounts
    return reaction(shouldFetchPersonalization, loadPersonalization)
  }, [])
}
