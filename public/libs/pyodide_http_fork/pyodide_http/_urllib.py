import sys
import traceback
from io import BytesIO

import urllib.request
import urllib.error
from http.client import HTTPResponse

from ._core import Request, send

_IS_PATCHED = False

import io


class FakeSock:
    def __init__(self, data):
        self.data = data

    def makefile(self, mode):
        return BytesIO(self.data)



class StreamSock:
    def __init__(self, header, body):
        self.stream = PrefixedReader(header, body)

    def makefile(self, mode):
        return self.stream




class PrefixedReader(io.RawIOBase):
    def __init__(self, prefix: bytes, reader: io.BufferedReader):
        
        self._prefix = memoryview(prefix)
        self._reader = reader

    def readable(self):
        return True

    def readinto(self, b: bytearray) -> int:
        
        size = len(b)
        buf = bytearray()

        
        if self._prefix is not None:
            if len(self._prefix) <= size:
                buf += self._prefix.tobytes()
                remaining = size - len(self._prefix)
                self._prefix = None
                if remaining:
                    chunk = self._reader.read(remaining)
                    if chunk:
                        buf += chunk
            else:
                buf += self._prefix[:size].tobytes()
                self._prefix = self._prefix[size:]
        else:
            
            chunk = self._reader.read(size)
            if chunk:
                buf += chunk

        
        b_view = memoryview(b)
        b_view[:len(buf)] = buf
        return len(buf)


def urlopen(url, *args, **kwargs):
    
    method = "GET"
    data = None
    headers = {}
    if isinstance(url, urllib.request.Request):
        current_jar.add_cookie_header(url)
        method = url.get_method()
        data = url.data
        headers = dict(url.header_items())
        url = url.full_url

    request = Request(method, url, headers=headers, body=data)
    resp = send(request)
    from js import console
    from pyodide.ffi import to_js
    

    
    
    
    
    

    """
    Ok so, pyodide_http reconstructs a raw HTTP response from the body that XHR returns. Problem is, XHR handles 
    things like gzip and chunking, so if we leave those headers, and send it to python's http, it freaks out trying
    to decode nonsense. super simple fix, we just remove the transfer-encoding header, and it behaves like normal
    bytes, and thats fine
    """
    headers_without_content_length = {
        k: v for k, v in resp.headers.items() if k.lower() not in ["content-length", "transfer-encoding"]
    }

    if resp.stream:
        response_header = (
                b"HTTP/1.1 "
                + str(resp.status_code).encode("ascii")
                + b"\n"
                + "\n".join(
            f"{key}: {value}" for key, value in headers_without_content_length.items()
        ).encode("ascii")
                + b"\n\n"
        )

        
        response = HTTPResponse(StreamSock(response_header, resp.body))
        response.url = url
        response.begin()
    else:
        response_data = (
                b"HTTP/1.1 "
                + str(resp.status_code).encode("ascii")
                + b"\n"
                + "\n".join(
            f"{key}: {value}" for key, value in headers_without_content_length.items()
        ).encode("ascii")
                + b"\n\n"
                + resp.body
        )
        
        response = HTTPResponse(FakeSock(response_data))
        response.url = url
        response.begin()

    
    if isinstance(url, urllib.request.Request):
        response.url = url.full_url
    else:
        response.url = url

    
    
    if not (200 <= response.status < 300):
        raise urllib.error.HTTPError(response.url, response.status, f"HTTP Error {response.status}", response.headers, None)

    return response


def urlopen_self_removed(self, url, *args, **kwargs):
    return urlopen(url, *args, **kwargs)


current_jar = None
current_cookies = None



class CookiePatch(urllib.request.HTTPCookieProcessor):
    def __init__(self, cookiejar):
        super().__init__(cookiejar)
        global current_jar
        current_jar = cookiejar


def patch():
    global _IS_PATCHED

    if _IS_PATCHED:
        return

    
    urllib.request.HTTPCookieProcessor = CookiePatch

    urllib.request.urlopen = urlopen
    urllib.request.OpenerDirector.open = urlopen_self_removed

    _IS_PATCHED = True
