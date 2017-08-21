<template>
	<div class="page">
		<mt-header fixed 
					class="music-header-2" 
					:title="topinfo.ListName + `第${_getDayOfYear(data.update_time)}天`" 
					:showTitle="showTitle">
	      <fallback slot="left"></fallback>
	      <span slot="right" style="font-size: 30px;font-weight: bold;display: inline-block;margin-top: -10px;">...</span>
	    </mt-header>
	    
	    <div class="page-content" style="overflow: hidden;">
	    	<div class="music-cover-wrap">
		    	 <div class="music-cover" 
		    	 	  ref="musicCover" 
		    	 	  :style="{backgroundImage:`url(${topinfo.pic_album})`}"></div>
		    	 <div class="title-wrap">
		    	 	<p class="main-title" v-if="topinfo.ListName">{{ topinfo.ListName }} 第{{ data.update_time | getDayOfYear }}天</p>
		    	 	<p class="minor-title" v-if="data.update_time">{{ data.update_time }}更新</p>
		    	 </div>
		    	 <div class="cover-overlay"></div>
		    </div>
	    	<div class="song-cotainer" v-if="songlist.length" ref="scrollTarget">
    			<mt-navbar :value="selected" @input="function(val) {selected = val}" style="margin-top:300px;">
				  <mt-tab-item id="1">单曲</mt-tab-item>
				  <mt-tab-item id="2">详情</mt-tab-item>
				  <!-- <mt-tab-item id="3">歌词本</mt-tab-item> -->
				</mt-navbar>
				<mt-tab-container v-model="selected" ref="scrollTouch" style="margin-top:-20px;">
					<mt-tab-container-item id="1">
						<ul style="list-style-type:none; padding-left:0px;">
							<li>
								<mt-cell class="music-cell-type4">
									<a @click="randomPlayAll">
										<img src="../assets/img/play.png" class="icon" style="width:24px;height:24px;margin-right:5px;">随机播放全部
									</a>
									<!-- <div>
										<a><img src="../assets/download.png" class="icon">下载</a>
										<a style="margin-left: 10px;"><img src="../assets/choice.png" class="icon">多选</a>
									</div> -->
								</mt-cell>
							</li>
							<li v-for="(song, index) in songlist" 
								key="index"
							    @click="playMusic(songlist, index, song.data.songid)">
								<mt-cell class="music-cell-type3">
									<div class="suffix">
										<p :style="index<3 && {color: '#FF4500'}">{{ index + 1}}</p>
										<p>
											<span class="icon" 
												  :style="{backgroundImage: `url('/static/value-up.png')`}"></span>
											{{ song.in_count | convertListenCount }}
										</p>
									</div>
									<div class="song">
										<p>{{ song.data.songname }}</p>
										<p>{{ song.data.singer | spliceSinger }} · {{ song.data.albumname }}</p>
									</div>
									<span class="detail">···</span>
								</mt-cell>
							</li>
						</ul>
					</mt-tab-container-item>
					<mt-tab-container-item id="2" v-if="selected == 2">
						<p  v-html="topinfo.info" 
							style="color: rgba(0, 0, 0, .5); 
							padding: 0 15px;
							font-size: 14px;
							line-height: 22px;
							margin-top: 20px;"></p>
					</mt-tab-container-item>
				</mt-tab-container>
	    	</div>
	    	<div class="ranklist-loading" v-else>
	    		<div class="loading">
	    			<mt-spinner type="fading-circle"></mt-spinner>
	    			<p>正在载入...</p>
	    		</div>
	    	</div>
    	</div>
	</div>
</template>
	
<script>
	import fallback from './fallback.vue';
	import { apiHandler } from '@/api/index';
	//import AlloyTouch from 'alloytouch';
	//import Transform from 'css3transform';
	import { lyricsAnalysis, getDayOfYear } from '../util';
	import { mapMutations, mapActions } from 'vuex';
	import base64 from 'base-64';
	import utf8 from 'utf8';
	
	/* ==============================================================
	 *                       RankList 组件
	 *	已完成UI：
	 *		随着列表滚动完成封面的模糊变化和标题的变化
	 *  Issuse:
	 *		在这里的话向大家推荐下AlloyTeam的 AlloyTouch
	 *		而不是Iscroll，相比较于Iscroll，AlloyTouch更加简洁
	 *		300多行的代码相比IScroll2000多的行的代码，大大减少了资源的占用,
	 *		源码的阅读也非常流畅.相比之下AlloyTouch也赋予了滚动更多的灵活性
	 *		而不像Iscroll必须要求Wapper和Scroll的限制，同时Iscroll对于高度
	 *		的严格要求在Vue的模板中经常会出现无法获取明确高度而导致无法滚动，需要
	 *		通过 Refresh 来刷新组件, 而AlloyTouch则不会又这种情况
	 * ============================================================= */
	const NameSpace = 'playing';

	export default {
		name: 'rankList',
		created() {
	        apiHandler({
	        	name: 'rankList',
	        	params: {
	        		topid: this.$route.params.id
	        	}
	        },(response) => {
	        	/*
	        	 * 延迟400ms执行等待页面切换动画完成
	        	 * 原由: 当不存在延迟时组件的内容渲染与页面的切换将会同时执行
	        	 * 由此将会导致在Chrome下产生卡顿
	        	 * */
		        setTimeout(() => {
		        	this.topinfo = response.topinfo;
			        this.songlist = response.songlist;
			        this.data = response;

			        // enable scroll 
			        this.$nextTick(() => {
			        	this._initScroll();
			        });
		        }, 400);
	        })
		},
		data() {
			return {
				topinfo: {},
				title: '',
				showTitle: false,
				data: {},
				songlist: [],
				selected: "1",
				coverScale: 1
			};
		},
		methods: {
			_initScroll() {
				let scrollTouch = this.$refs.scrollTouch.$el,
					scrollTarget = this.$refs.scrollTarget;

				Transform(scrollTarget, true);

				let self = this;	
				let alloyTouch = new AlloyTouch({
					touch: scrollTouch,
					target: scrollTarget,
					sensitivity: .8,
					bindSelf: true,
					property: 'translateY',
					max: 0,
					change(pos) {
						let coverHeight = -scrollTouch.clientWidth*.7 + 40;
						function enableScroll() {
							this.fixed = scrollTouch.scrollTop > 0 ? true : false;
						};

						// Toggle The Title When Pos Change
						self.showTitle = pos <= -60 ? true : false;
						
						if (pos <= coverHeight) {
							// Fiexd The RankList When List Scroll To Top
							this.target[this.property] = coverHeight;

							// enable tab container scrolled When List Scroll To Top
							this.preventDefault = false;
							enableScroll.call(this)
						}else {
							this.preventDefault = true;
						}
						self._blurringCover(pos/coverHeight);
					}
				});
			},
			_blurringCover(percentage) {
				let blur = 30,
					musicCover = this.$refs.musicCover;
				musicCover.style.filter = `blur(${(percentage*blur >> 0)}px)`;
			},
			_getDayOfYear: getDayOfYear,
			randomPlayAll() {
				this.stackSonglist(this.songlist);
				this.switchPlayOrder('random');
				this.playSong('next');
			},
			...mapMutations(NameSpace, ['switchPlayOrder', 'stackSonglist']),
			...mapActions(NameSpace, ['playSong'])
		}
	}
</script>

<style lang="scss">
.mint-header{
	background-color: #31c27c;
}
	.music-cover-wrap {
		position: relative;
		margin-top: 0px;
		z-index: 0;
		.music-cover {
			 width: 100%;
			 background-repeat: no-repeat;
			 background-size: cover;
			 transition: blur .3s ease;
			 &:after {
			 	display: block;
			 	content: '';
			 	padding-top: 90%;
			 }
		}
		.title-wrap {
			position: absolute;
			width: 100%;
			bottom: 25%;
			color: #ffffff;
			z-index: 3;
			.main-title, .minor-title {
				text-align: center;
				margin-top: 0;
				margin-bottom: 5px;
			}
			.main-title {
				font-size: 18px;
			}
			.minor-title {
				font-size: 14px;
			}
		}
		.cover-overlay {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, .7);
			z-index: 2;
		}
	}
	.mint-cell-wrapper {
		background-image: none;
		padding: 0 20px;
	}
	.song-cotainer, .ranklist-loading {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		background-color: transparent;
		overflow: hidden;
		&:before {
			display: block;
			content: '';
			margin-top: 70%;
		}
		.lyrics-wrapper {
			line-height: 42px;
		    text-align: center;
		    font-size: 16px;
		}
	}
	.ranklist-loading {
		bottom: 0;
		.loading {
			display: flex;
			justify-content: center;
			padding-top: 30%;
			height: 100%;
			background-color: #fff;
			p {
				margin-top: 10px;
				margin-left: 10px;
				font-size: 10px;
				color: rgba(0, 0, 0, .5);
			}
		}
	}
.music-cell-type3 {
	p {
		margin: 0;
	}
	&:last-child {
		background-image: none;
	}
	.mint-cell-wrapper {
		padding: 0;
		height: 60px;
		background-image: linear-gradient(180deg, #eae7e7, #eae7e7 50%, transparent 50%);
	}
	.mint-cell-title {
		flex: initial;
	}
	.mint-cell-value {
		flex: 1;
		padding: 0 10px;
		pack: justify;
		justify-content: space-between;
		overflow: hidden;
		.suffix {
			width: 50px;
			p {
				text-align: center;
				font-size-adjust: 1;
			}
			p:first-child {
				margin-bottom: 5px;
			}
			p:nth-child(2) {
				.icon {
					display: inline-block;
					width: 24px;
					height: 24px;
					background-size: cover;
					background-repeat: no-repeat;
				}
				font-size: 9px;
				color: rgba(0, 0, 0, .5);
			}
		}
		.song {
			flex: 1;
			overflow: hidden;
			p {
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			p:first-child {
				color: initial;
				font-size: 16px;
			}
			p:nth-child(2) {
				margin-top: 5px;
				font-size: 12px;
				color: rgba(0, 0, 0, .5);
			}
		}
		.detail {
			display: inline-block;
			margin-right: 15px;
			margin-left: 10px;
			font-size: 18px;
			font-weight: bold;
		}
	}
}

</style>