import React from "react";

export interface TagItem {
  tag_id: number;
  tag_name: string;
}

interface TagListProps {
  tags: TagItem[];
  onTagClick: (tagId: number) => () => void;
}

const TagList: React.FC<TagListProps> = ({ tags, onTagClick }) => {
  if (!tags || tags.length === 0) {
    return <p className="text-gray-400 text-sm">タグがありません</p>;
  }

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2 text-gray-100">タグ</h3>
      <div className="flex flex-wrap gap-2 text-sm">
        {tags.map((tag) => (
          <span
            key={tag.tag_id}
            onClick={onTagClick(tag.tag_id)}
            className="px-2 py-1 bg-gray-700 rounded text-gray-100 hover:bg-gray-600 cursor-pointer transition-colors"
          >
            {tag.tag_name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagList;
