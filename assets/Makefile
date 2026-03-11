MP4_FILES := $(wildcard *.mp4)
TARGETS   := $(addsuffix /.done,$(basename $(MP4_FILES)))

all: $(TARGETS)

%/.done: %.mp4
	@echo "Packaging $< into $(dir $@)"
	@mkdir -p $(dir $@)
	bash ../scripts/package_mp4.sh $<
	touch $@
