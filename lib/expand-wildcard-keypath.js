const get = require('dlv')

function error(name, msg) {
  const err = new Error(msg)
  err.name = name
  return err
}

function isArray(arg) {
  return Array.isArray(arg)
}
function isString(arg) {
  return typeof arg === 'string'
}
function isObject(arg) {
  return typeof arg === 'object' && arg !== null
}

/**
 * Expand wildcard `char` for `keypaths` in `root`. The results can be used by a utility function like lodash.get or dlv. For example:
 * ```js
 * let keypaths = [
 *   ['arr.*'],
 *   ['arr.*.*']
 * ]
 * expand(keypaths, { arr: ['a','b','c']}) // => [['arr', 0], ['arr', 1], ['arr', 2]]
 * expand(keypaths, { arr: ['a','b','c']}) // => [['arr', 0], ['arr', 1], ['arr', 2]]
 * ```
 * @param {Object|Array} root
 * @param {Array<string|number>[]} keypaths
 * @param {string} [char='*']
 * @returns {Array<string|number>[]}
 */
function expandWildcardKeypath(root, keypaths, char) {
  if (!isObject(root)) {
    throw error('EINVALID_ARGUMENT', 'root must be an object or array')
  }
  if (!isArray(keypaths) || keypaths.filter((keypath) => !isString(keypath) && !isArray(keypath)).length) {
    throw error('EINVALID_ARGUMENT', 'keypaths must be strings or arrays of strings')
  }

  const expanded = keypaths.reduce((result, keypath) => {
    if (isString(keypath)) keypath = keypath.split('.')
    const wildcard = keypath.indexOf(char)
    if (wildcard > -1) {
      const pre = keypath.slice(0, wildcard)
      const wildcardRoot = get(root, pre)
      const looped = isArray(wildcardRoot) ? wildcardRoot : Object.keys(wildcardRoot)

      looped.forEach((entry, index) => {
        const pp = Array.from(keypath)
        pp.splice(wildcard, 1, isArray(wildcardRoot) ? index : entry)
        result.push(pp)
      })
    } else {
      result.push(keypath)
    }
    return result
  }, [])
  if (expanded.find((entry) => entry.indexOf(char) > -1)) {
    return expandWildcardKeypath(root, expanded, char)
  }
  return expanded
}

module.exports = expandWildcardKeypath
