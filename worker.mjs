const files = ASSET_TABLE;
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/request') {
      if (request.method !== 'POST') return new Response(null,{status:405});
      if (request.headers.get('origin') && request.headers.get('origin') !== url.origin) return new Response(null,{status:403});
      let a;
      try { a=await request.json(); } catch { return new Response(null,{status:400}); }
      const valid = a && typeof a.name==='string' && a.name.trim() && a.name.length<=100 &&
        typeof a.phone==='string' && a.phone.length<=32 && /^[+\d\s().-]+$/.test(a.phone) && /^\d{7,15}$/.test(a.phone.replace(/\D/g,'')) &&
        ['email','messenger'].includes(a.channel) && typeof a.email==='string' && a.email.length<=254 &&
        (a.channel!=='email'||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) &&
        typeof a.product==='string' && a.product.length<=100 && typeof a.sample==='boolean' && /^[a-f0-9-]{36}$/.test(a.token);
      if(!valid) return new Response(null,{status:422});
      const {name,phone,channel,email,product,sample}=a;
      await env.BUCKET.put('requests/'+a.token+'.json',JSON.stringify({name,phone,channel,email,product,sample,received:new Date().toISOString()}));
      return Response.json({accepted:true},{headers:{'Cache-Control':'no-store'}});
    }
    if(!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405});
    const file=files[url.pathname==='/'?'/index.html':/^\/catalog\/?$/.test(url.pathname)?'/catalog.html':url.pathname];
    if(!Array.isArray(file)) return new Response('Страница не найдена',{status:404});
    const data=request.method==='HEAD'?null:Uint8Array.from(atob(file[1]),c=>c.charCodeAt(0));
    return new Response(data,{headers:{'Content-Type':file[0],'X-Content-Type-Options':'nosniff'}});
  }
};
