// @ts-ignore
import home from './home.html';
import { makeBadge } from './utils';
export interface Env {
  view_counter: KVNamespace;
}

function handleHome() {
  return new Response(home, {
    headers: {
      'Content-Type': 'text/html;charset=utf-8',
    },
  });
}

async function handleVisit(searchParams: URLSearchParams, env: Env) {
  const page = searchParams.get('page');
  if (!page) return handleBadRequest();

  const kvPage = await env.view_counter.get(page);
  let value = 1;
  if (!kvPage) {
    await env.view_counter.put(page, value + '');
  } else {
    value = parseInt(kvPage) + 1;
    console.log(value);
    await env.view_counter.put(page, value + '');
  }
  return new Response(makeBadge(value), {
    headers: {
      'Content-Type': 'image/svg+xml;charset=utf-8',
    },
  });
}

function handleBadRequest() {
  return new Response(null, {
    status: 400,
  });
}

function handleNotFound() {
  return new Response(null, {
    status: 404,
  });
}

// request :  user가 이동할 url 같은 정보
// env :  perk -> cloudflare worker에 추가할 perk
// ctx :
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);
    switch (pathname) {
      case '/':
        return handleHome();
      case '/visit':
        return handleVisit(searchParams, env);
      default:
        return handleNotFound();
    }
  },
};
