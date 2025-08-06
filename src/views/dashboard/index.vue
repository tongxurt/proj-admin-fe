<template>
  <div class="video-management-container">
    <!-- 头部搜索和筛选区域 -->
    <div class="header-section">
      <div class="header-center">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索"
          class="search-input"
          prefix-icon="el-icon-search"
          clearable
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            type="primary"
          />
        </el-input>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="年/月/日"
          end-placeholder="年/月/日"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          class="date-picker"
        />

      </div>

      <div class="header-right">
        <!-- <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddVideoDialog"
        >添加入库</el-button> -->
        <el-button
          type="primary"
          size="small"
          @click="loadVideos"
        >刷新</el-button>
        <el-upload
          action="#"
          :auto-upload="false"
          :on-change="handleVideoChange"
          accept=".mp4,.mov,.avi"
        >
          <el-button
            size="small"
            type="primary"
          >点击上传</el-button>
        </el-upload>
      </div>
    </div>

    <!-- 视频网格展示区域 -->
    <div class="video-grid">
      <div
        v-for="video in videoList"
        :key="video.id"
        class="video-card"
        @click="handleVideoClick(video)"
      >
        <div class="video-thumbnail">
          <img
            v-if="video.status === 'created'"
            src="../../assets/404_images/created.svg"
            class="created"
            alt=""
          >
          <img
            :src="video.coverUrl"
            :alt="video.title"
            class="thumbnail-img"
          >
          <div class="play-overlay">
            <i class="el-icon-video-play play-icon" />
          </div>
        </div>

        <div class="video-info">
          <div class="video-title">{{ video.title }}</div>
          <div class="video-date">{{ moment().format("YYYY-MM-DD HH:mm:SS",video.createdAt) }}</div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <!-- <div class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[12, 24, 36, 48]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div> -->
    <!-- 添加视频素材弹框 -->
    <el-dialog
      title="添加视频素材"
      :visible.sync="addVideoDialogVisible"
      width="1200px"
      :before-close="handleCloseDialog"
      class="add-video-dialog"
    >
      <div class="dialog-content">
        <!-- 左侧表单区域 -->
        <div class="form-section">
          <!-- 视频文件上传 -->
          <div class="upload-section">
            <h3>视频文件</h3>
            <el-upload
              class="video-upload"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleVideoChange"
              :file-list="videoFileList"
              accept=".mp4,.mov,.avi"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">拖拽文件到此处或点击上传</div>
              <div class="el-upload__tip">支持 MP4, MOV, AVI 格式, 最大 500MB</div>
            </el-upload>
            <div class="ai-status">AI分析状态: {{ aiAnalysisStatus }}</div>
          </div>

          <!-- 基本信息 -->
          <div class="basic-info-section">
            <h3>基本信息</h3>
            <el-form
              ref="videoForm"
              :model="videoForm"
              :rules="videoRules"
              label-width="100px"
            >
              <el-form-item
                label="视频标题"
                prop="title"
                required
              >
                <el-input
                  v-model="videoForm.title"
                  placeholder="请输入视频标题"
                />
              </el-form-item>

              <el-form-item label="视频描述">
                <el-input
                  v-model="videoForm.description"
                  type="textarea"
                  placeholder="请输入视频描述"
                  :rows="3"
                />
              </el-form-item>

              <el-form-item
                label="视频来源"
                prop="source"
                required
              >
                <el-select
                  v-model="videoForm.source"
                  placeholder="请选择视频来源"
                >
                  <el-option
                    label="抖音"
                    value="douyin"
                  />
                  <el-option
                    label="快手"
                    value="kuaishou"
                  />
                  <el-option
                    label="小红书"
                    value="xiaohongshu"
                  />
                  <el-option
                    label="B站"
                    value="bilibili"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="发布时间">
                <el-date-picker
                  v-model="videoForm.releaseTime"
                  type="date"
                  placeholder="选择日期"
                  format="yyyy/MM/dd"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 分类信息 -->
          <div class="classification-section">
            <h3>分类信息</h3>
            <el-form
              :model="videoForm"
              label-width="100px"
            >
              <el-form-item
                label="素材类型"
                prop="materialType"
                required
              >
                <el-radio-group v-model="videoForm.materialType">
                  <el-radio label="vlog">vlog测评</el-radio>
                  <el-radio label="celebrity">明星种草</el-radio>
                  <el-radio label="influencer">达人种草</el-radio>
                  <el-radio label="product">产品展款</el-radio>
                  <el-radio label="dialogue">双人对话</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="类目">
                <div class="cascader-container">
                  <el-select
                    v-model="videoForm.category1"
                    placeholder="请选择"
                    class="cascader-select"
                  >
                    <el-option
                      label="服饰内衣"
                      value="clothing"
                    />
                    <el-option
                      label="数码产品"
                      value="digital"
                    />
                    <el-option
                      label="美妆护肤"
                      value="beauty"
                    />
                  </el-select>

                  <el-select
                    v-model="videoForm.category2"
                    placeholder="请选择"
                    class="cascader-select"
                  >
                    <el-option
                      label="女装"
                      value="women"
                    />
                    <el-option
                      label="男装"
                      value="men"
                    />
                    <el-option
                      label="童装"
                      value="children"
                    />
                  </el-select>

                  <el-select
                    v-model="videoForm.category3"
                    placeholder="请选择"
                    class="cascader-select"
                  >
                    <el-option
                      label="连衣裙"
                      value="dress"
                    />
                    <el-option
                      label="T恤"
                      value="tshirt"
                    />
                    <el-option
                      label="牛仔裤"
                      value="jeans"
                    />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 标签 -->
          <div class="tags-section">
            <h3>标签</h3>
            <div class="tag-input-container">
              <el-input
                v-model="newTag"
                placeholder="添加标签,按回车确认"
                class="tag-input"
                @keyup.enter.native="addTag"
              />
              <el-button
                type="primary"
                class="add-tag-btn"
                @click="addTag"
              >添加</el-button>
            </div>

            <div class="selected-tags">
              <el-tag
                v-for="tag in videoForm.tags"
                :key="tag"
                closable
                class="tag-item"
                @close="removeTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>

            <div class="tag-count">已添加 {{ videoForm.tags.length }}/10 个标签</div>

            <div class="common-tags">
              <div class="common-tags-title">常用标签:</div>
              <el-tag
                v-for="tag in commonTags"
                :key="tag"
                class="common-tag"
                @click="addCommonTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 右侧预览区域 -->
        <div class="preview-section">
          <!-- 视频预览 -->
          <div class="video-preview">
            <h3>视频预览</h3>
            <div class="preview-container">
              <div
                v-if="!videoForm.videoUrl"
                class="empty-preview"
              >
                <i class="el-icon-video-camera" />
                <p>上传视频后在此处预览</p>
              </div>
              <video
                v-else
                :src="videoForm.videoUrl"
                controls
                class="video-player"
              />
            </div>

            <!-- 封面预览 -->
            <div
              v-if="videoForm.coverUrl"
              class="thumbnail-preview"
            >
              <h4>视频封面</h4>
              <img
                :src="videoForm.coverUrl"
                alt="视频封面"
                class="cover-image"
              >
            </div>
          </div>

          <!-- 视频信息预览 -->
          <div class="video-info-preview">
            <h3>{{ videoForm.title || '未命名视频' }}</h3>
            <p class="video-description">{{ videoForm.description || '暂无描述' }}</p>

            <div class="video-controls">
              <span class="video-time">00:00</span>
              <i class="el-icon-video-play" />
              <i class="el-icon-download" />
              <i class="el-icon-share" />
            </div>
          </div>

          <!-- 视频信息 -->
          <div class="video-details">
            <h3>视频信息</h3>
            <div class="info-item">
              <span class="label">素材类型:</span>
              <span class="value">{{ getMaterialTypeText(videoForm.materialType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">类目:</span>
              <span class="value">{{ getCategoryText() }}</span>
            </div>
            <div class="info-item">
              <span class="label">标签:</span>
              <span class="value">{{ videoForm.tags.join(',') || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="label">来源:</span>
              <span class="value">{{ getSourceText(videoForm.source) || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="label">发布时间:</span>
              <span class="value">{{ videoForm.releaseTime || '--' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleCloseDialog">取消</el-button>
        <el-button
          type="primary"
          @click="submitVideo"
        >提交</el-button>
      </div>
    </el-dialog>

    <!-- 视频详情弹框 -->
    <el-dialog
      title="视频详情分析"
      :visible.sync="videoDetailDialogVisible"
      width="1400px"
      class="video-detail-dialog"
    >
      <div class="video-detail-content">
        <!-- 预览图片区域 -->
        <div class="video-preview-header">
          <div class="preview-image">
            <img
              :src="currentVideo.coverUrl"
              :alt="currentVideo.title"
            >
            <!-- <div class="play-overlay">
              <i class="el-icon-video-play" />
            </div> -->
          </div>
          <div class="preview-info">
            <h3 class="video-title">{{ currentVideo.title }}</h3>
            <p class="video-description">{{ moment().format("YYYY-MM-DD HH:mm:SS",currentVideo.createdAt) }}</p>
            <div class="video-tags">
              <el-tag
                v-for="tag in currentVideo.tags"
                :key="tag"
                size="small"
                class="preview-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <div>
          <div class="commodity-info">
            品牌：
            <div style="color: #333;">{{ currentVideo.commodity.brand }}</div>
          </div>
          <div class="commodity-info">
            产品名称：
            <div
              v-for="item in currentVideo.commodity.name"
              :key="item"
              style="color: #333;"
            >
              {{ item }}
            </div>
          </div>
        </div>

        <div class="tab-content">
          <el-table
            :data="currentVideo.analysis.segments"
            style="width: 100%"
          >
            <el-table-column
              type="index"
              label="镜头序号"
              width="100"
              align="center"
            />
            <el-table-column
              prop="timeEnd"
              label="视频秒数"
              width="120"
              align="center"
            />
            <el-table-column
              prop="voiceover"
              label="口播文案"
              min-width="200"
            >
              <template slot-scope="scope">
                <div class="voiceover-text">{{ scope.row.voiceOverScript }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="interpretation"
              label="画面解读"
              min-width="200"
            >
              <template slot-scope="scope">
                <div class="interpretation-text">{{ scope.row.description }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="tags"
              label="标签分类"
              min-width="200"
            >
              <template slot-scope="scope">
                <el-tag
                  v-for="tag in scope.row.stage.tags"
                  :key="tag"
                  size="small"
                  class="shot-tag"
                >
                  {{ tag }}
                </el-tag>
                <el-tag
                  v-for="tag in scope.row.elements.personType"
                  :key="tag"
                  size="small"
                  class="shot-tag"
                >
                  {{ tag }}
                </el-tag>
                <el-tag
                  size="small"
                  class="shot-tag"
                >
                  {{ scope.row.stage.name }}
                </el-tag>
                <el-tag
                  size="small"
                  class="shot-tag"
                >
                  {{ scope.row.elements.personCount }}
                </el-tag>
                <el-tag
                  size="small"
                  class="shot-tag"
                >
                  {{ scope.row.elements.voiceOverType }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 标签页导航 -->
        <!-- <el-tabs
          v-model="activeTab"
          type="card"
          class="detail-tabs"
        >
          <el-tab-pane
            label="AI 分镜分析"
            name="shot-analysis"
          >
            <div class="tab-content">
              <h3>AI 分镜分析与标签系统</h3>
              <el-table
                :data="shotAnalysisData"
                style="width: 100%"
              >
                <el-table-column
                  prop="shotNo"
                  label="镜头序号"
                  width="100"
                  align="center"
                />
                <el-table-column
                  prop="duration"
                  label="视频秒数"
                  width="120"
                  align="center"
                />
                <el-table-column
                  prop="voiceover"
                  label="口播文案"
                  min-width="200"
                >
                  <template slot-scope="scope">
                    <div class="voiceover-text">{{ scope.row.voiceover }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="interpretation"
                  label="画面解读"
                  min-width="200"
                >
                  <template slot-scope="scope">
                    <div class="interpretation-text">{{ scope.row.interpretation }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="tags"
                  label="标签分类"
                  min-width="200"
                >
                  <template slot-scope="scope">
                    <el-tag
                      v-for="tag in scope.row.tags"
                      :key="tag"
                      size="small"
                      class="shot-tag"
                    >
                      {{ tag }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="reference"
                  label="画面参考"
                  width="120"
                  align="center"
                >
                  <template slot-scope="scope">
                    <div class="reference-image">
                      <img
                        :src="scope.row.reference"
                        :alt="scope.row.shotNo"
                      >
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <div class="view-more">
                <el-button
                  type="text"
                  @click="viewMoreShots"
                >查看更多分镜 →</el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="AI 自动标签"
            name="ai-tags"
          >
            <div class="tab-content">
              <h3>AI 自动标签</h3>
              <p class="ai-tags-desc">系统自动识别以下三类标签:</p>

              <div class="tag-section">
                <h4>素材类型及类目</h4>
                <div class="tag-group">
                  <el-tag
                    v-for="tag in aiTags.materialType"
                    :key="tag"
                    class="ai-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <div class="tag-section">
                <h4>三段式脚本结构</h4>
                <div class="tag-group">
                  <el-tag
                    v-for="tag in aiTags.scriptStructure"
                    :key="tag"
                    class="ai-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <div class="tag-section">
                <h4>元素类目</h4>
                <div class="tag-group">
                  <el-tag
                    v-for="tag in aiTags.elementCategory"
                    :key="tag"
                    class="ai-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <div class="selected-ai-tags">
                <h4>已选标签</h4>
                <el-tag
                  v-for="tag in selectedAiTags"
                  :key="tag"
                  closable
                  class="selected-tag"
                  @close="removeAiTag(tag)"
                >
                  {{ tag }}
                </el-tag>
              </div>

              <div class="custom-tag-section">
                <h4>添加自定义标签</h4>
                <div class="custom-tag-input">
                  <el-input
                    v-model="customTag"
                    placeholder="输入新标签"
                    class="custom-input"
                  />
                  <el-button
                    type="primary"
                    @click="addCustomTag"
                  >添加</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="素材创作模型"
            name="creation-model"
          >
            <div class="tab-content">
              <h3>素材创作模型</h3>
              <div class="model-grid">
                <div class="model-column">
                  <h4 class="column-title">开头-3秒 (提升完层/序篇)</h4>
                  <div class="column-content">
                    <div class="content-section">
                      <h5>文案</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.opening.copywriting"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                    <div class="content-section">
                      <h5>画面</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.opening.visuals"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="model-column">
                  <h4 class="column-title">中部讲述 (结解卖点)</h4>
                  <div class="column-content">
                    <div class="content-section">
                      <h5>文案</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.middle.copywriting"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                    <div class="content-section">
                      <h5>画面</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.middle.visuals"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="model-column">
                  <h4 class="column-title">尾部特化 (提示转化)</h4>
                  <div class="column-content">
                    <div class="content-section">
                      <h5>文案</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.ending.copywriting"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                    <div class="content-section">
                      <h5>画面</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.ending.visuals"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="model-column">
                  <h4 class="column-title">元素分类</h4>
                  <div class="column-content">
                    <div class="content-section">
                      <h5>人物</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.elements.characters"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                    <div class="content-section">
                      <h5>画面</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.elements.visuals"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                    <div class="content-section">
                      <h5>配乐</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.elements.soundtrack"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                    <div class="content-section">
                      <h5>配音</h5>
                      <div class="tag-list">
                        <el-tag
                          v-for="item in creationModel.elements.voiceover"
                          :key="item"
                          class="model-tag"
                        >{{ item }}</el-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs> -->
      </div>

      <!-- <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="videoDetailDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveVideoDetail"
        >保存更改</el-button>
      </div> -->
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getList, add } from '../../api/dashboard'
import moment from 'moment'
import { performSingleUpload } from '../../api/oss'

export default {
  name: 'VideoManagement',
  data () {
    return {
      searchKeyword: '',
      dateRange: [],
      moment,
      creator: '',
      tag: '',
      materialType: 'vlog',
      category: 'clothing',
      subCategory: 'women',
      detailCategory: 'dress',
      currentPage: 1,
      pageSize: 12,
      total: 100,
      videoList: [],
      // 弹框相关数据
      addVideoDialogVisible: false,
      videoFileList: [],
      aiAnalysisStatus: '等待上传视频',
      newTag: '',
      commonTags: ['正向反馈', '产品引入', '机械营销', '达人', '口播类'],
      videoForm: {
        title: '',
        description: '',
        source: 'douyin',
        releaseTime: '2025-08-04',
        materialType: 'vlog',
        category1: 'clothing',
        category2: 'women',
        category3: 'dress',
        tags: ['vlog测评', '服饰内衣', '女装', '连衣裙'],
        videoUrl: '',
        coverUrl: '' // 新增封面图片URL字段
      },
      videoRules: {
        title: [
          { required: true, message: '请输入视频标题', trigger: 'blur' }
        ],
        source: [
          { required: true, message: '请选择视频来源', trigger: 'change' }
        ],
        materialType: [
          { required: true, message: '请选择素材类型', trigger: 'change' }
        ]
      },
      // AI 分镜分析与标签系统弹框
      shotAnalysisDialogVisible: false,
      shotAnalysisData: [],
      // AI 自动标签弹框
      aiTagsDialogVisible: false,
      aiTags: {
        materialType: ['vlog测评', '服饰内衣', '女装', '连衣裙'],
        scriptStructure: ['开头—正向反馈', '中部—产品引入', '尾部—机械营销'],
        elementCategory: ['达人', '画面风格', '口播类', '室内直播间']
      },
      selectedAiTags: ['vlog测评', '服饰内衣', '女装', '连衣裙'],
      customTag: '',
      // 素材创作模型弹框
      creationModelDialogVisible: false,
      creationModel: {
        opening: {
          copywriting: ['正向反馈', '痛点直击类', '情绪价值', '价格优惠', '场景需求', '信用背书'],
          visuals: ['产品特写+动态细节画面', '对比冲击画面', '色彩集中画面', '场景还原画面(真人素材)', '痛点具像化画面', '情绪放大画面']
        },
        middle: {
          copywriting: ['产品引入', '身份介绍', '产品材质', '产品外观', '产品工艺', '产品背书'],
          visuals: ['原料/成分画面', '工艺/技术画面', '使用展示画面', '高频使用场景', '痛点解决场景', '仪式感场景']
        },
        ending: {
          copywriting: ['机械营销', 'CUE 受众', '放出优惠', '身份承诺'],
          visuals: ['价格对比+优惠标签画面', '倒计时+价格标签画面', '权威认证画面', '真实用户画面', '品牌实力画面', '使用效果画面']
        },
        elements: {
          characters: ['明星', '达人', '素人', '无人'],
          visuals: ['画面风格', '空间布局', '产品展示', '人物展示', '画面包装'],
          soundtrack: ['口播类', '剧情类', '测评类', 'vlog类', '展示类', '二商类', '卡点类', '混剪类'],
          voiceover: ['第三方配音', '原音']
        }
      },
      // 视频详情弹框
      videoDetailDialogVisible: false,
      activeTab: 'shot-analysis', // 默认显示AI分镜分析
      currentVideo: {
        analysis: {
          segments: []
        },
        commodity: {
          name: [],
          brand: ''
        }
      } // 用于存储当前选中的视频详情
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted () {
    this.loadVideos()
  },
  methods: {
    handleVideoClick (video) {
      // this.$message.info(`播放视频: ${video.title}`)
      // 显示视频详情弹框
      this.showVideoDetailDialog(video)
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.loadVideos()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.loadVideos()
    },
    async loadVideos () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        const res = await getList()
        this.videoList = res.data.list
      } catch (error) {
        console.error('加载视频数据失败:', error)
      } finally {
        loading.close()
      }
    },
    // 弹框相关方法
    showAddVideoDialog () {
      this.addVideoDialogVisible = true
    },
    handleCloseDialog () {
      this.addVideoDialogVisible = false
      this.resetVideoForm()
    },
    async handleVideoChange (file) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        this.aiAnalysisStatus = '正在上传视频...'

        // 设置视频URL用于预览
        this.videoForm.videoUrl = URL.createObjectURL(file.raw)

        // 获取视频第一帧作为封面
        this.aiAnalysisStatus = '正在生成封面...'
        const thumbnailDataUrl = await this.getVideoThumbnail(file.raw)

        // 将Base64转换为Blob用于上传
        const thumbnailBlob = this.dataURLtoBlob(thumbnailDataUrl)

        // 上传封面图片
        const [videoRes, thumbnailRes] = await Promise.all([performSingleUpload(file.raw, () => { }), performSingleUpload(thumbnailBlob, () => { })])
        console.log('封面上传结果:', videoRes, thumbnailRes)

        // 保存封面URL
        this.videoForm.coverUrl = thumbnailRes.data?.url || thumbnailDataUrl

        this.aiAnalysisStatus = '分析完成'
        await add({
          coverUrl: thumbnailRes,
          url: videoRes,
          title: file.name
        })
        this.loadVideos()
      } catch (error) {
        console.error('视频处理失败:', error)
        this.aiAnalysisStatus = '处理失败'
        this.$message.error('视频处理失败，请重试')
      } finally {
        loading.close()
      }
    },

    // 获取视频第一帧的方法
    getVideoThumbnail (videoFile) {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        video.onloadedmetadata = () => {
          // 设置canvas尺寸
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // 跳转到第一帧
          video.currentTime = 0.03 // 设置为0.1秒，避免可能的黑帧
        }

        video.onseeked = () => {
          try {
            // 将视频帧绘制到canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            // 转换为base64数据URL
            const dataURL = canvas.toDataURL('image/jpeg', 0.8)

            // 清理资源
            video.src = ''
            URL.revokeObjectURL(video.src)

            resolve(dataURL)
          } catch (error) {
            reject(error)
          }
        }

        video.onerror = (error) => {
          reject(error)
        }

        // 设置视频源
        video.src = URL.createObjectURL(videoFile)
        video.load()
      })
    },

    // 将DataURL转换为Blob的辅助方法
    dataURLtoBlob (dataURL) {
      const arr = dataURL.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }

      // 生成带时间戳的文件名
      const timestamp = Date.now()
      return new File([u8arr], `thumbnail_${timestamp}.jpg`, { type: mime })
    },
    addTag () {
      if (this.newTag && this.videoForm.tags.length < 10) {
        if (!this.videoForm.tags.includes(this.newTag)) {
          this.videoForm.tags.push(this.newTag)
        }
        this.newTag = ''
      }
    },
    removeTag (tag) {
      const index = this.videoForm.tags.indexOf(tag)
      if (index > -1) {
        this.videoForm.tags.splice(index, 1)
      }
    },
    addCommonTag (tag) {
      if (this.videoForm.tags.length < 10 && !this.videoForm.tags.includes(tag)) {
        this.videoForm.tags.push(tag)
      }
    },
    getMaterialTypeText (type) {
      const typeMap = {
        'vlog': 'vlog测评',
        'celebrity': '明星种草',
        'influencer': '达人种草',
        'product': '产品展款',
        'dialogue': '双人对话'
      }
      return typeMap[type] || '--'
    },
    getCategoryText () {
      const category1Map = { 'clothing': '服饰内衣', 'digital': '数码产品', 'beauty': '美妆护肤' }
      const category2Map = { 'women': '女装', 'men': '男装', 'children': '童装' }
      const category3Map = { 'dress': '连衣裙', 'tshirt': 'T恤', 'jeans': '牛仔裤' }

      const c1 = category1Map[this.videoForm.category1] || ''
      const c2 = category2Map[this.videoForm.category2] || ''
      const c3 = category3Map[this.videoForm.category3] || ''

      return [c1, c2, c3].filter(Boolean).join(' > ') || '--'
    },
    getSourceText (source) {
      const sourceMap = {
        'douyin': '抖音',
        'kuaishou': '快手',
        'xiaohongshu': '小红书',
        'bilibili': 'B站'
      }
      return sourceMap[source] || '--'
    },
    resetVideoForm () {
      this.videoForm = {
        title: '',
        description: '',
        source: 'douyin',
        releaseTime: '2025-08-04',
        materialType: 'vlog',
        category1: 'clothing',
        category2: 'women',
        category3: 'dress',
        tags: ['vlog测评', '服饰内衣', '女装', '连衣裙'],
        videoUrl: '',
        coverUrl: '' // 重置封面URL
      }
      this.videoFileList = []
      this.aiAnalysisStatus = '等待上传视频'
      this.newTag = ''
    },
    submitVideo () {
      this.$refs.videoForm.validate((valid) => {
        if (valid) {
          console.log('提交视频数据:', this.videoForm)
          this.$message.success('视频添加成功！')
          this.handleCloseDialog()
        } else {
          this.$message.error('请完善必填信息')
        }
      })
    },
    // AI 分镜分析与标签系统弹框
    showShotAnalysisDialog () {
      this.shotAnalysisDialogVisible = true
      // 2秒后显示AI自动标签弹框
      setTimeout(() => {
        this.showAiTagsDialog()
      }, 2000)
    },
    viewMoreShots () {
      console.log('查看更多分镜')
      // 实际应用中可以加载更多分镜数据
    },
    // AI 自动标签弹框
    showAiTagsDialog () {
      this.aiTagsDialogVisible = true
      // 2秒后显示素材创作模型弹框
      setTimeout(() => {
        this.showCreationModelDialog()
      }, 2000)
    },
    addCustomTag () {
      if (this.customTag && this.selectedAiTags.length < 10) {
        if (!this.selectedAiTags.includes(this.customTag)) {
          this.selectedAiTags.push(this.customTag)
        }
        this.customTag = ''
      }
    },
    removeAiTag (tag) {
      const index = this.selectedAiTags.indexOf(tag)
      if (index > -1) {
        this.selectedAiTags.splice(index, 1)
      }
    },
    // 素材创作模型弹框
    showCreationModelDialog () {
      this.creationModelDialogVisible = true
    },
    saveCreationModel () {
      console.log('保存素材创作模型:', this.creationModel)
      this.$message.success('素材创作模型已保存！')
      this.creationModelDialogVisible = false
    },
    // 视频详情弹框
    showVideoDetailDialog (video) {
      this.currentVideo = video
      this.videoDetailDialogVisible = true
    },
    saveVideoDetail () {
      console.log('保存视频详情:', {
        activeTab: this.activeTab,
        selectedAiTags: this.selectedAiTags,
        customTag: this.customTag
      })
      this.$message.success('视频详情已保存！')
      this.videoDetailDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.video-management-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-center {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
    margin: 0 20px;

    .search-input {
      width: 300px;
    }

    .date-picker {
      width: 280px;
    }

    .filter-select {
      width: 150px;
    }
  }

  .header-right {
    display: flex;
    gap: 20px;
    .el-button {
      padding: 12px 20px;
    }
  }
}

.filter-section {
  display: flex;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  gap: 20px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .filter-label {
      font-size: 14px;
      color: #666;
      white-space: nowrap;
    }

    .filter-select {
      width: 150px;
    }
  }

  .reset-btn {
    margin-left: auto;
  }
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.video-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .video-thumbnail {
    position: relative;
    height: 200px;
    overflow: hidden;

    .created {
      position: absolute;
      left: -22px;
      top: -22px;
      width: 100px;
      height: 100px;
    }

    .thumbnail-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .play-icon {
        font-size: 24px;
        color: white;
      }
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.3) 0%,
        transparent 50%,
        rgba(0, 0, 0, 0.3) 100%
      );
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px;

      .overlay-text {
        color: white;
        font-size: 12px;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }

      .video-duration {
        color: white;
        font-size: 12px;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        align-self: flex-end;
      }
    }
  }

  .video-info {
    padding: 15px;

    .video-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .video-date {
      font-size: 12px;
      color: #999;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

// 弹框样式
.add-video-dialog {
  .el-dialog__body {
    padding: 0;
  }
}

.dialog-content {
  display: flex;
  min-height: 600px;
}

.form-section {
  flex: 1;
  padding: 20px;
  border-right: 1px solid #eee;
  overflow-y: auto;
  max-height: 600px;

  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .upload-section {
    margin-bottom: 30px;

    .video-upload {
      .el-upload-dragger {
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    }

    .ai-status {
      margin-top: 10px;
      font-size: 12px;
      color: #666;
    }
  }

  .basic-info-section,
  .classification-section,
  .tags-section {
    margin-bottom: 30px;
  }

  .cascader-container {
    display: flex;
    gap: 10px;

    .cascader-select {
      flex: 1;
    }
  }

  .tag-input-container {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;

    .tag-input {
      flex: 1;
    }

    .add-tag-btn {
      width: 80px;
    }
  }

  .selected-tags {
    margin-bottom: 10px;

    .tag-item {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }

  .tag-count {
    font-size: 12px;
    color: #666;
    margin-bottom: 15px;
  }

  .common-tags {
    .common-tags-title {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }

    .common-tag {
      margin-right: 8px;
      margin-bottom: 8px;
      cursor: pointer;
    }
  }
}

.preview-section {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;

  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .video-preview {
    margin-bottom: 30px;

    .preview-container {
      height: 200px;
      border: 2px dashed #ddd;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;

      .empty-preview {
        text-align: center;
        color: #999;

        i {
          font-size: 48px;
          margin-bottom: 10px;
        }

        p {
          margin: 0;
          font-size: 14px;
        }
      }

      .video-player {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .thumbnail-preview {
    margin-top: 15px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .cover-image {
      width: 100%;
      max-width: 200px;
      height: auto;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
  }

  .video-info-preview {
    margin-bottom: 30px;
    padding: 15px;
    background: white;
    border-radius: 8px;

    h3 {
      margin-bottom: 10px;
      font-size: 16px;
    }

    .video-description {
      color: #666;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .video-controls {
      display: flex;
      align-items: center;
      gap: 15px;
      color: #666;

      .video-time {
        font-size: 12px;
      }

      i {
        font-size: 16px;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .video-details {
    .info-item {
      display: flex;
      margin-bottom: 10px;
      font-size: 14px;

      .label {
        width: 80px;
        color: #666;
        flex-shrink: 0;
      }

      .value {
        color: #333;
        flex: 1;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
  padding: 20px;
  border-top: 1px solid #eee;
}

// 视频详情弹框样式
.video-detail-dialog {
  .video-detail-content {
    .video-preview-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;

      .preview-image {
        position: relative;
        width: 150px;
        height: 100px;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          .play-icon {
            font-size: 20px;
            color: white;
          }
        }
      }

      .preview-info {
        flex: 1;

        .video-title {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;
        }

        .video-description {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .video-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #999;
          margin-bottom: 10px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
        }

        .video-tags {
          .preview-tag {
            margin-right: 8px;
            margin-bottom: 8px;
            background-color: #f5f5f5;
            border-color: #ddd;
            color: #666;
          }
        }
      }
    }

    .detail-tabs {
      .el-tabs__content {
        padding: 20px;
      }
    }

    .tab-content {
      h3 {
        margin-bottom: 15px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .voiceover-text,
      .interpretation-text {
        line-height: 1.4;
        color: #333;
      }

      .shot-tag {
        margin-right: 5px;
        margin-bottom: 5px;
      }

      .reference-image {
        width: 80px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .view-more {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }

      // AI 自动标签样式
      .ai-tags-desc {
        color: #666;
        margin-bottom: 20px;
      }

      .tag-section {
        margin-bottom: 25px;

        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .tag-group {
          .ai-tag {
            margin-right: 8px;
            margin-bottom: 8px;
            background-color: #f5f5f5;
            border-color: #ddd;
            color: #666;
          }
        }
      }

      .selected-ai-tags {
        margin: 20px 0;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 4px;

        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .selected-tag {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }

      .custom-tag-section {
        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .custom-tag-input {
          display: flex;
          gap: 10px;

          .custom-input {
            flex: 1;
          }
        }
      }

      // 素材创作模型样式
      .model-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        max-height: 600px;
        overflow-y: auto;

        .model-column {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 15px;
          background: #fafafa;

          .column-title {
            margin: 0 0 15px 0;
            font-size: 14px;
            font-weight: 600;
            color: #333;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }

          .column-content {
            .content-section {
              margin-bottom: 15px;

              h5 {
                margin: 0 0 8px 0;
                font-size: 12px;
                font-weight: 600;
                color: #666;
              }

              .tag-list {
                .model-tag {
                  display: block;
                  margin-bottom: 5px;
                  font-size: 11px;
                  padding: 2px 6px;
                  background-color: #f0f0f0;
                  border-color: #ddd;
                  color: #666;
                }
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .header-section {
    .header-center {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;

      .search-input,
      .date-picker,
      .filter-select {
        width: 100%;
      }
    }
  }

  .filter-section {
    flex-wrap: wrap;
    gap: 15px;

    .filter-item {
      flex: 1;
      min-width: 200px;
    }
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .dialog-content {
    flex-direction: column;

    .form-section {
      border-right: none;
      border-bottom: 1px solid #eee;
      max-height: none;
    }
  }

  .video-detail-dialog {
    .video-detail-content {
      .tab-content {
        .model-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .video-management-container {
    padding: 10px;
  }

  .header-section {
    flex-direction: column;
    gap: 15px;

    .header-center {
      margin: 0;
    }
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;

    .filter-item {
      flex: none;
    }
  }

  .video-grid {
    grid-template-columns: 1fr;
  }

  .video-detail-dialog {
    .video-detail-content {
      .tab-content {
        .model-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}

.commodity-info {
  display: flex;
  gap: 10px;
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
  padding-left: 20px;
  margin-bottom: 20px;
}
</style>
