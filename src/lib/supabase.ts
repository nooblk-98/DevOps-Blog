// Lightweight Supabase-compatible client shim using our /api backend

type OrderOpts = { ascending?: boolean }
type SelectOpts = { count?: 'exact', head?: boolean }

class Query<T=any> {
  private table: string
  private selectStr: string = '*'
  private filters: Array<{op:string,col:string,val:any}> = []
  private orderBy?: { column: string, ascending: boolean }
  private _limit?: number
  private _offset?: number
  private _action: 'select'|'insert'|'upsert'|'delete' = 'select'
  private _data: any = null
  private _opts: any = {}

  constructor(table: string) { this.table = table }

  select(sel: string, opts?: SelectOpts) { this.selectStr = sel; this._opts = opts || {}; return this }
  eq(col: string, val: any) { this.filters.push({op:'eq',col,val}); return this }
  in(col: string, arr: any[]) { this.filters.push({op:'in',col,val:arr}); return this }
  neq(col: string, val: any) { this.filters.push({op:'neq',col,val}); return this }
  gte(col: string, val: any) { this.filters.push({op:'gte',col,val}); return this }
  lte(col: string, val: any) { this.filters.push({op:'lte',col,val}); return this }
  order(column: string, opts?: OrderOpts) { this.orderBy = { column, ascending: opts?.ascending !== false }; return this }
  limit(n: number) { this._limit = n; return this }
  range(from: number, to: number) { this._offset = from; this._limit = to - from + 1; return this }
  insert(data: any) { this._action = 'insert'; this._data = data; return this }
  upsert(data: any, _opts?: any) { this._action = 'upsert'; this._data = data; return this }
  delete() { this._action = 'delete'; return this }
  single() { return this.then(res=> ({ data: Array.isArray(res.data)? res.data[0] : res.data, error: res.error })) }

  async exec(): Promise<{ data: T, error: any, count?: number }> {
    try {
      // posts
      if (this.table === 'posts') {
        if (this._action === 'delete') {
          const idFilter = this.filters.find(f=>f.op==='eq' && f.col==='id')
          const id = idFilter ? idFilter.val : undefined
          const resp = await fetch(`/api/posts/${id}`, { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
          if (!resp.ok) throw new Error('Delete failed')
          return { data: null as any, error: null }
        }
        if (this._action === 'upsert') {
          const resp = await fetch('/api/posts', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this._data) })
          const json = await resp.json()
          return { data: json.data, error: null }
        }
        // count request
        if (this._opts?.count === 'exact' && this._opts?.head) {
          const params = this.toQuery()
          const resp = await fetch(`/api/posts?${params}`)
          const json = await resp.json()
          return { data: null as any, error: null, count: (json.data || []).length }
        }
        const params = this.toQuery()
        const resp = await fetch(`/api/posts?${params}`)
        const json = await resp.json()
        return { data: json.data, error: null }
      }

      if (this.table === 'categories') {
        if (this._opts?.count === 'exact' && this._opts?.head) {
          const resp = await fetch('/api/categories')
          const json = await resp.json()
          return { data: null as any, error: null, count: (json.data || []).length }
        }
        if (this._action === 'insert' || this._action === 'upsert') {
          const resp = await fetch('/api/categories', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this._data) })
          const ok = resp.ok
          return { data: ok ? this._data : null, error: ok? null : await resp.text() as any }
        }
        if (this._action === 'delete') {
          const id = this.filters.find(f=>f.op==='eq' && f.col==='id')?.val
          const resp = await fetch(`/api/categories/${id}`, { method: 'DELETE', credentials: 'include' })
          return { data: null as any, error: resp.ok? null : await resp.text() as any }
        }
        const resp = await fetch('/api/categories')
        const json = await resp.json()
        return { data: json.data, error: null }
      }

      if (this.table === 'post_categories') {
        if (this._action === 'insert') {
          // expect array of { post_id, category_id }
          const postId = (this._data?.[0]?.post_id) || this.filters.find(f=>f.op==='eq' && f.col==='post_id')?.val
          const category_ids = (this._data || []).map((x:any)=>x.category_id)
          const resp = await fetch('/api/post_categories/bulk', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: postId, category_ids }) })
          return { data: null as any, error: resp.ok? null : await resp.text() as any }
        }
        if (this._action === 'delete') {
          // handled implicitly by bulk insert after delete
          return { data: null as any, error: null }
        }
        // select for post_ids by category_id
        const category_id = this.filters.find(f=>f.op==='eq' && f.col==='category_id')?.val
        const resp = await fetch(`/api/post_categories?category_id=${category_id}`)
        const json = await resp.json()
        return { data: json.data, error: null }
      }

      if (this.table === 'tags') {
        if (this._action === 'upsert') {
          const resp = await fetch('/api/tags/upsert', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this._data) })
          const json = await resp.json()
          return { data: json.data, error: null }
        }
        // not otherwise used
        return { data: [] as any, error: null }
      }

      if (this.table === 'post_tags') {
        // selection for related posts: select('post_id').in('tag_id', [...]).neq('post_id', id).limit(n)
        if (this._action === 'select' && this.filters.some(f=>f.op==='in' && f.col==='tag_id')) {
          const tags = this.filters.find(f=>f.op==='in' && f.col==='tag_id')?.val || []
          const exclude = this.filters.find(f=>f.op==='neq' && f.col==='post_id')?.val
          const params = new URLSearchParams()
          params.set('tag_ids', tags.join(','))
          if (exclude) params.set('exclude_post_id', String(exclude))
          if (this._limit) params.set('limit', String(this._limit))
          const resp = await fetch(`/api/post_tags/by_tags?${params.toString()}`)
          const json = await resp.json()
          return { data: json.data, error: null }
        }
        if (this._action === 'insert') {
          const postId = (this._data?.[0]?.post_id) || this.filters.find(f=>f.op==='eq' && f.col==='post_id')?.val
          const tag_ids = (this._data || []).map((x:any)=>x.tag_id)
          const resp = await fetch('/api/post_tags/bulk', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: postId, tag_ids }) })
          return { data: null as any, error: resp.ok? null : await resp.text() as any }
        }
        if (this._action === 'delete') { return { data: null as any, error: null } }
        return { data: [] as any, error: null }
      }

      if (this.table === 'comments') {
        if (this._opts?.count === 'exact' && this._opts?.head) {
          const resp = await fetch('/api/comments')
          const json = await resp.json()
          return { data: null as any, error: null, count: (json.data || []).length }
        }
        if (this._action === 'insert') {
          const resp = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this._data) })
          return { data: null as any, error: resp.ok? null : await resp.text() as any }
        }
        if (this._action === 'delete') {
          const id = this.filters.find(f=>f.op==='eq' && f.col==='id')?.val
          const resp = await fetch(`/api/comments/${id}`, { method: 'DELETE', credentials: 'include' })
          return { data: null as any, error: resp.ok? null : await resp.text() as any }
        }
        const post_id = this.filters.find(f=>f.op==='eq' && f.col==='post_id')?.val
        const url = post_id !== undefined ? `/api/comments?post_id=${post_id}` : '/api/comments'
        const resp = await fetch(url)
        const json = await resp.json()
        return { data: json.data, error: null }
      }

      if (this.table === 'settings') {
        if (this._action === 'upsert' || this._action === 'insert') {
          const payload = Array.isArray(this._data) ? this._data : [this._data]
          const resp = await fetch('/api/settings', { method:'POST', credentials:'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          return { data: null as any, error: resp.ok? null : await resp.text() as any }
        }
        const resp = await fetch('/api/settings')
        const json = await resp.json()
        return { data: json.data, error: null }
      }

      if (this.table === 'post_views') {
        const resp = await fetch('/api/posts')
        const json = await resp.json()
        const views = (json.data || []).map((p:any)=> p.post_views?.[0] || { view_count: 0 })
        return { data: views as any, error: null }
      }

      return { data: [] as any, error: null }
    } catch (e: any) {
      return { data: null as any, error: e }
    }
  }

  private toQuery(): string {
    const params: Record<string, string> = {}
    this.filters.forEach(f => {
      if (f.op==='eq') params[f.col] = String(f.val)
      if (f.op==='in' && Array.isArray(f.val)) params['ids'] = f.val.join(',')
      if (f.op==='gte') params['from'] = String(f.val)
      if (f.op==='lte') params['to'] = String(f.val)
    })
    if (this.orderBy) {
      params['order'] = this.orderBy.column
      params['asc'] = this.orderBy.ascending ? '1' : '0'
    }
    if (typeof this._offset !== 'undefined') params['offset'] = String(this._offset)
    if (this._limit) params['limit'] = String(this._limit)
    const q = new URLSearchParams(params)
    return q.toString()
  }

  then(onFulfilled: any, onRejected: any) { return this.exec().then(onFulfilled, onRejected) }
}

export const supabase = {
  from(table: string) { return new Query(table) },
  rpc(name: string, params: any) {
    if (name === 'increment_post_view') {
      const id = params.post_id_to_increment
      return fetch(`/api/posts/${id}/increment_view`, { method:'POST' }).then(r=>({ data: null, error: r.ok? null : r.statusText }))
    }
    return Promise.resolve({ data: null, error: 'Unknown RPC' })
  },
  auth: {
    async signInWithPassword({ email, password }: { email: string, password: string }) {
      const resp = await fetch('/api/auth/signin', { method:'POST', credentials:'include', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }) })
      const json = await resp.json()
      if (!resp.ok) return { data: null, error: json }
      return { data: json, error: null }
    },
    async getSession() {
      const resp = await fetch('/api/auth/session', { credentials: 'include' })
      const json = await resp.json()
      return { data: { session: json.session } }
    },
    onAuthStateChange(callback: any) {
      // Simple polling fallback
      let prev: any = null
      const interval = setInterval(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if ((!!session) !== (!!prev)) callback('TOKEN_CHANGED', session)
        prev = session
      }, 3000)
      return { data: { subscription: { unsubscribe: () => clearInterval(interval) } } }
    },
    async signOut() {
      await fetch('/api/auth/signout', { method:'POST', credentials:'include' })
      return { error: null }
    }
  },
  storage: {
    from(_bucket: string) {
      return {
        list: async (prefix = '', _opts?: any) => {
          // If asking for 'public' folder, we return empty to avoid duplicates,
          // since our storage does not use subfolders.
          if (prefix && prefix.startsWith('public')) {
            return { data: [], error: null }
          }
          const resp = await fetch('/api/storage/list', { credentials:'include' })
          const json = await resp.json()
          return { data: (json.data || []).map((f:any)=> ({ name: f.name, id: f.id, created_at: f.created_at, path: f.path })), error: null }
        },
        getPublicUrl: (path: string) => {
          let p = String(path || '')
          if (!p.startsWith('uploads/')) p = p.replace(/^public\//,'')
          if (!p.startsWith('uploads/')) p = `uploads/${p}`
          return { data: { publicUrl: `/${p}` } }
        },
        upload: async (path: string, file: File|Blob) => {
          const form = new FormData()
          form.append('file', file)
          const resp = await fetch('/api/storage/upload', { method:'POST', credentials:'include', body: form })
          const json = await resp.json()
          return { data: json, error: resp.ok? null : await resp.text() as any }
        },
        remove: async (paths: string[]) => {
          const p = paths[0]
          const resp = await fetch(`/api/storage/remove?path=${encodeURIComponent(p)}`, { method:'DELETE', credentials:'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: p }) })
          return { data: null, error: resp.ok? null : await resp.text() as any }
        }
      }
    }
  }
}
