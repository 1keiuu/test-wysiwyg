<template>
  <div class="container">
    <div class="tab">
      <div class="tab-item" @click="handleButtonClick(0)">
        <p :class="{ '--active': activeTab === 0 }">editor</p>
      </div>
      <div class="tab-item" @click="handleButtonClick(1)">
        <p :class="{ '--active': activeTab === 1 }">preview</p>
      </div>
    </div>
    <div v-if="activeTab === 0" class="editor">
      <quill-editor
        ref="myQuillEditor"
        v-model="content"
        :options="editorOption"
        @blur="onEditorBlur($event)"
        @focus="onEditorFocus($event)"
        @ready="onEditorReady($event)"
        @change="textChange($event)"
      />
      <div class="image-wrapper">
        <div class="image__inner">
          <svg
            class="icon"
            version="1.1"
            id="_x32_"
            xmlns="http://www.w3.org/2000/svg"
            x="0"
            y="0"
            viewBox="0 0 512 512"
            style="width:18px;height:18px"
            xml:space="preserve"
            opacity="1"
          >
            <path
              class="st0"
              d="M0 47.702v416.596h512V47.702H0zm50.881 365.715V98.583h410.238v314.834H50.881z"
              fill="#4b4b4b"
            />
            <path
              class="st0"
              d="M203.438 215.101c19.575 0 35.501-15.926 35.501-35.503 0-19.575-15.926-35.501-35.501-35.501-19.577 0-35.503 15.926-35.503 35.501 0 19.577 15.926 35.503 35.503 35.503zM290.963 202.322c-7.238 0-13.989 3.715-18.055 9.942L231.38 275.85c-3.529 5.404-9.138 8.502-15.392 8.504-6.306 0-11.945-3.14-15.468-8.618-4.058-6.31-10.84-10.076-18.14-10.076-7.298 0-14.08 3.765-18.141 10.076L94.08 384.795h327.623L309.02 212.263c-4.068-6.226-10.817-9.941-18.057-9.941z"
              fill="#4b4b4b"
            />
          </svg>
          <input type="file" @change="onImageChange" />
        </div>
      </div>
    </div>
    <div class="preview" v-if="activeTab === 1">
      <div v-html="content"></div>
    </div>
  </div>

  <!-- Or manually control the data synchronization -->
  <!-- <quill-editor
    :content="content"
    :options="editorOption"
    @change="onEditorChange($event)"
  /> -->
</template>

<script>
// You can also register Quill modules in the component
// import Quill from 'quill'
// import someModule from '../yourModulePath/someQuillModule.js'
// Quill.register('modules/someModule', someModule)
// import ImageResize from "quill-image-resize-module";

// Quill.register('modules/imageResize', ImageResize);
import Compressor from "compressorjs";

export default {
  data() {
    return {
      content: "",
      editorOption: {
        placeholder: "",
        modules: {
          toolbar: [
            "bold",
            { align: "center" },
            { header: [1, 2, 3, 4, 5, 6] },
            "underline",
            "strike",
            { color: ["#fff", "#000", "#FF0000"] },
            { background: ["#fff", "#000", "#FF0000"] },
          ],
          imageResize: true,
        },
      },
      editorIndex: 0,
      activeTab: 0,
    };
  },
  methods: {
    handleButtonClick(index) {
      this.activeTab = index;
    },
    async onImageChange(event) {
      function toBlob(base64) {
        var bin = atob(base64.replace(/^.*,/, ""));
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i);
        }
        // Blobを作成
        try {
          var blob = new Blob([buffer.buffer], {
            type: "image/png",
          });
        } catch (e) {
          return false;
        }
        return blob;
      }
      if (!event.target.files[0]) return;
      const reg = /(.*)(?:\.([^.]+$))/;
      const extension = event.target.files[0].name.match(reg)[2];
      const array = ["jpeg", "jpg", "png"];
      if (!array.includes(extension)) {
        alert("jpg/.jpeg/.png のファイル形式のみ保存できます。");
        return;
      }
      try {
        let file = event.target.files[0];
        // アップロード用
        // 圧縮
        new Compressor(file, {
          quality: 0.1,
          maxWidth: 600,
          maxHeight: 600,
          success(result) {
            let reader = new FileReader();
            reader.onload = function(e) {
              pushDataUriToArray(e.target.result);
            };
            reader.readAsDataURL(result);
          },
          error(err) {
            alert("画像の読み込みに失敗しました");
            console.log(err.message);
          },
        });
        // 圧縮した画像のdataURIをimages配列へ
        const pushDataUriToArray = async (dataURI) => {
          var size_in_megabytes = toBlob(dataURI)["size"] / 1024 / 1024;
          if (size_in_megabytes > 5) {
            // this.displayImages.splice(this.displayImages.length - 1, 1);
            alert("ファイルのサイズの上限は5MBまでです");
            throw "ファイルのサイズの上限は5MBまでです";
          }
          this.$refs.myQuillEditor.quill.insertEmbed(
            this.editorIndex,
            "image",
            dataURI
          );
        };
      } catch (error) {
        console.log(error);
        alert("画像の読み込みに失敗しました");
      }
    },
    textChange() {
      // 入力中のindexを取得
      if (this.editor.getSelection()) {
        this.editorIndex = this.editor.getSelection().index;
      }
      console.log(this.editorIndex);
    },
    addImage() {
      console.log(event);
      this.$refs.myQuillEditor.quill.insertEmbed(this.editorIndex, "image");
    },
    onEditorBlur(quill) {
      console.log("editor blur!", quill);
    },
    onEditorFocus(quill) {
      console.log("editor focus!", quill);
      if (this.editor.getSelection()) {
        this.editorIndex = this.editor.getSelection().index;
      }
      console.log(this.editorIndex);
    },
    onEditorReady(quill) {
      console.log("editor ready!", quill);
    },
    onEditorChange({ quill, html, text }) {
      console.log("editor change!", quill, html, text);
      this.content = html;
      var length = quill.getLength();
      console.log(length);
    },
    click() {
      console.log(this.content);
    },
  },
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill;
    },
  },
  mounted() {
    console.log("this is current quill instance object", this.editor);
  },
};
</script>

<style scoped>
::v-deep .ql-toolbar.ql-snow {
  background: #fff;
  position: fixed;
  top: 60px;
  height: 40px;
  width: 100%;
  z-index: 5;
}
::v-deep .ql-container.ql-snow {
  border: 0;
}
::v-deep .ql-editor {
  margin-top: 45px;
  min-height: 100vh;
}
::v-deep .ql-align-center {
  text-align: center;
}
::v-deep .ql-toolbar.ql-snow {
  border: 0;
}
p.--active {
  color: red;
}
.tab p {
  text-align: center;
}
.container {
  position: relative;
}
.tab {
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 10px;
  background: #fff;
  z-index: 2;
}
.tab-item {
  width: 50%;
}
.editor {
  padding-top: 110px;
}
.preview {
  padding: 100px 15px 0;
}
.image-wrapper {
  position: fixed;
  background: #fff;
  z-index: 3;
  width: 100%;
  padding: 8px;
  top: 100px;
}
.image-wrapper .image__inner {
  width: 18px;
  height: 18px;
  padding-left: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-wrapper .icon {
  margin: 0;
}
.image-wrapper input {
  opacity: 0;
  position: absolute;
  z-index: 2;
  top: 0;
  width: 30px;
}
::v-deep .preview img {
  max-width: 100%;
}

::v-deep .preview p {
  font-size: 13px;
}
::v-deep .preview h1 {
  font-size: 26px;
}
::v-deep .preview h2 {
  font-size: 19.5px;
}
::v-deep .preview h3 {
  font-size: 15px;
}
::v-deep .preview h4 {
  font-size: 13px;
}
::v-deep .preview h5 {
  font-size: 11px;
}
::v-deep .preview h6 {
  font-size: 10px;
}
</style>
