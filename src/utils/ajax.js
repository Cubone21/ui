import axios from 'axios'

let links

export const setAJAXLinks = ({updatedLinks}) => {
  links = updatedLinks
}

// do not prefix route with basepath, ex. for external links
const addBasepath = (url, excludeBasepath) => {
  const basepath = window.basepath || ''

  return excludeBasepath ? url : `${basepath}${url}`
}

const generateResponseWithLinks = (response, newLinks) => {
  const {
    auth,
    logout,
    external,
    users,
    allUsers,
    organizations,
    me: meLink,
    config,
    environment,
  } = newLinks

  return {
    ...response,
    auth: {links: auth},
    logoutLink: logout,
    external,
    users,
    allUsers,
    organizations,
    meLink,
    config,
    environment,
  }
}

const AJAX = async (
  {url, resource, id, method = 'GET', data = {}, params = {}, headers = {}},
  {excludeBasepath} = {}
) => {
  try {
    if (!links) {
      console.error(
        `AJAX function has no links. Trying to reach url ${url}, resource ${resource}, id ${id}, method ${method}`
      )
    }

    url = addBasepath(url, excludeBasepath)

    if (resource) {
      url = id
        ? addBasepath(`${links[resource]}/${id}`, excludeBasepath)
        : addBasepath(`${links[resource]}`, excludeBasepath)
    }

    const response = await axios({
      url,
      method,
      data,
      params,
      headers,
    })

    // TODO: Just return the unadulterated response without grafting auth, me,
    // and logoutLink onto this object, once those are retrieved via their own
    // AJAX request and action creator.
    return links ? generateResponseWithLinks(response, links) : response
  } catch (error) {
    throw links ? generateResponseWithLinks(error, links) : error // eslint-disable-line no-throw-literal
  }
}

export const getAJAX = async url => {
  try {
    return await axios({
      method: 'GET',
      url: addBasepath(url),
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

export default AJAX
