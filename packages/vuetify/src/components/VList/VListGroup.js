// Components
import VIcon from '../../components/VIcon'

// Mixins
import Bootable from '../../mixins/bootable'
import Toggleable from '../../mixins/toggleable'
import {
  inject as RegistrableInject
} from '../../mixins/registrable'

// Transitions
import { VExpandTransition } from '../transitions'

/* @vue/component */
export default {
  name: 'v-list-group',

  mixins: [
    Bootable,
    RegistrableInject('list', 'v-list-group', 'v-list'),
    Toggleable
  ],

  inject: ['listClick'],

  props: {
    activeClass: {
      type: String,
      default: 'primary--text'
    },
    appendIcon: {
      type: String,
      default: '$vuetify.icons.expand'
    },
    disabled: Boolean,
    group: String,
    noAction: Boolean,
    prependIcon: String,
    subGroup: Boolean
  },

  data: () => ({
    groups: []
  }),

  computed: {
    groupClasses () {
      return {
        'v-list__group--active': this.isActive,
        'v-list__group--disabled': this.disabled
      }
    },
    headerClasses () {
      return {
        'v-list__group__header--active': this.isActive,
        'v-list__group__header--sub-group': this.subGroup
      }
    },
    itemsClasses () {
      return {
        'v-list__group__items--no-action': this.noAction
      }
    }
  },

  watch: {
    isActive (val) {
      if (!this.subGroup && val) {
        this.listClick(this._uid)
      }
    },
    $route (to) {
      /**
       * to => 
        fullPath: "/users/list"
        hash: ""
        matched: (2) [{…}, {…}]
        meta: {}
        name: "components/users/list"
        params: {}
        path: "/users/list"
        query: {}
       */
      const isActive = this.matchRoute(to.path)

      if (this.group) {
        if (isActive && this.isActive !== isActive) {
          this.listClick(this._uid)
        }

        this.isActive = isActive
      }
    }
  },

  mounted () {
    this.list.register(this._uid, this.toggle)

    if (this.group &&
      this.$route &&
      this.value == null
    ) {
      this.isActive = this.matchRoute(this.$route.path)
    }
  },

  beforeDestroy () {
    this.list.unregister(this._uid)
  },

  methods: {
    click () {
      if (this.disabled) return

      this.isActive = !this.isActive
    },
    genIcon (icon) {
      return this.$createElement(VIcon, icon)
    },
    genAppendIcon () {
      const icon = !this.subGroup ? this.appendIcon : false

      if (!icon && !this.$slots.appendIcon) return null

      return this.$createElement('div', {
        staticClass: 'v-list__group__header__append-icon'
      }, [
        this.$slots.appendIcon || this.genIcon(icon)
      ])
    },
    genGroup () {
      return this.$createElement('div', {
        staticClass: 'v-list__group__header',
        'class': this.headerClasses,
        on: Object.assign({}, {
          click: this.click
        }, this.$listeners),
        ref: 'item'
      }, [
        this.genPrependIcon(),
        this.$slots.activator,
        this.genAppendIcon()
      ])
    },
    genItems () {
      return this.$createElement('div', {
        staticClass: 'v-list__group__items',
        'class': this.itemsClasses,
        directives: [{
          name: 'show',
          value: this.isActive
        }],
        ref: 'group'
      }, this.showLazyContent(this.$slots.default))
    },
    genPrependIcon () {
      const icon = this.prependIcon
        ? this.prependIcon
        : this.subGroup
          ? '$vuetify.icons.subgroup'
          : false

      if (!icon && !this.$slots.prependIcon) return null

      return this.$createElement('div', {
        staticClass: 'v-list__group__header__prepend-icon',
        'class': {
          [this.activeClass]: this.isActive
        }
      }, [
        this.$slots.prependIcon || this.genIcon(icon)
      ])
    },
    toggle (uid) {
      // TODO 这里的 uid 是什么？
      this.isActive = this._uid === uid
    },
    /**
     * to 相关配置在路由中，group 配置在 menu.js。因此需要思考：是否可以统一由 路由 来生成 侧边栏
     * to: '/users/list', this.group: 'users' =>  return true
     */
    matchRoute (to) {
      if (!this.group) return false
      return to.match(this.group) !== null
    }
  },

  render (h) {
    return h('div', {
      staticClass: 'v-list__group',
      'class': this.groupClasses
    }, [
      this.genGroup(),
      h(VExpandTransition, [this.genItems()])
    ])
  }
}
