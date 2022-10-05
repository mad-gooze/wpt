def main(request, response):
    content = """
    <!DOCTYPE html>
      <html>
        <body>
          <section>
            Verify navigation type is back_forward after posting, navigating away and
            then back.
          </section>
          <section>
            <form action="navigation_type_post_back.py" method="post">
              Post to page <button type="submit">Press to POST page</button>
            </form>
            <a href="blank_page_green.html">navigate away</a>.
          </section>
          <script>
            window.addEventListener('unload', (event) => {
            });
          </script>
        </body>
      </html>
    """
    return content
