<div class="table-responsive">
    <table class="table table-striped table-hover">
        <thead class="table-dark">
            <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Created</th>
                <th>File</th>
                <th>Source</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {% for document in documents %}
            <tr>
                <td><input type="checkbox" name="selected_documents" value="{{ document.scraped_data_id }}">
                </td>

                <td>{{ documents.start_index|add:forloop.counter0 }}</td>
                <td>{{ document.created_at }}</td>

                <td>
                    {% if document.file_type %}
                    <span class="badge bg-info">{{ document.file_type }}</span>
                    {% else %}
                    <span class="text-muted">N/A</span>
                    {% endif %}
                </td>

                
                <td>{{ document.title }}</td>

                <td>
                    <button type="button" class="btn btn-sm btn-danger"
                        onclick="deleteDocument('{{ document.scraped_data_id }}')">
                        Delete
                    </button>
                </td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
</div>
