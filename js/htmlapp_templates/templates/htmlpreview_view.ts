export default `

<style>
.lawtext-htmlpreview-view {
}

.lawtext-htmlpreview-view .state-block {
  padding-top: 1rem;
  text-align: center;
}

.lawtext-htmlpreview-view .hello-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
}

.lawtext-htmlpreview-view .no-law-block {
  padding-top: 5rem;
}

.lawtext-htmlpreview-view .htmlpreview-block {
  padding: 2rem 3rem 10rem 3rem;
}
</style>

<% if(data.opening_file) { %>
<div class="lawtext-htmlpreview-overlay state-block">
  <div class="container-fluid">
    <p>ファイルを読み込み中です...</p>
  </div>
</div>
<% } %>

<% if(!data.opening_file && _(law_html).isNull()) { %>
<div class="lawtext-htmlpreview-overlay hello-block">
  <div>
    <div class="container-fluid">
      <p style="font-size: 3em; text-align: center;">
        Lawtextへようこそ！
      </p>
    </div>
  </div>

  <div class="row justify-content-center search-law-block" style="margin: 1em;">
    <div class="col-md-6" style="max-width: 500px;">
      <form>
        <div class="input-group">
          <input name="law-query"
                 class="form-control search-law-textbox"
                 placeholder="法令名か法令番号を検索" aria-label="法令名か法令番号を検索"
                 <% if(data.law_search_key) { %>value="<%= data.law_search_key %>"<% } %>
                 >
          <span class="input-group-btn">
            <button class="btn btn-secondary search-law-button" type="submit" >検索</button>
          </span>
        </div>
      </form>
    </div>
  </div>

  <div>
    <div class="container-fluid">
      <div style="text-align: center;">
        <button class="lawtext-open-file-button btn btn-primary">法令ファイルを開く</button>
      </div>
    </div>
  </div>

  <div class="text-muted" style="align-self: center; max-width: 500px; margin-top: 4em;">
    <div class="container-fluid">
      <p style="text-align: center;">
        法令ファイルがありませんか？
      </p>
      <ul>
        <li><a href="http://elaws.e-gov.go.jp/" target="_blank">e-Gov</a>から法令XMLをダウンロードできます。</li>
        <li>メモ帳などのテキストエディタで、<a href="https://github.com/yamachig/lawtext" target="_blank">Lawtext</a>ファイルを作れます。<a class="lawtext-download-sample-lawtext-button" href="#" onclick="return false;">サンプルをダウンロード</a></li>
      </ul>
    </div>
  </div>

  <% if(location.href.startsWith("file:")) { %>
    <div class="text-muted" style="align-self: center; max-width: 500px; margin-top: 4em;">
      このページはファイルから直接表示されているため、法令名・番号検索機能など、一部の機能が動作しない場合があります。
      <a href="https://yamachig.github.io/lawtext-app/" target="_blank" style="white-space: nowrap;">Web版Lawtext</a>
    </div>
  <% } else { %>
    <div class="text-muted" style="align-self: center; max-width: 500px; margin-top: 1em;">
      <div class="container-fluid">
        <hr>
        <p style="text-align: center;">
          <a href="https://yamachig.github.io/lawtext-app/download.html" target="_blank">ダウンロード版Lawtext</a>
        </p>
      </div>
    </div>
  <% } %>

</div>
<% } %>

<% if(!_(law_html).isNull()) { %>
<div class="htmlpreview-block">
  <%= law_html %>
</div>
<% } %>

`;